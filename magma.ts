/*
 * MIT License
 * Copyright (c) 2021 S. Beeblebrox
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

namespace Magma {
    export async function transpile(text: string, {spacesToTabs = 0, macros = new Map<string, string>(), warn = (message: string) => console.warn(message), info = (message: string) => console.log(message)} = {}, evalFunction: (x: string)=>any = eval) {
        const
            BACKSLASH = '\\',
            exports = new Map<string, string[]>(),
            tags = new Map<string, string[]>(),
            instructions: string[] = ['execute'],
            conditions: {(): boolean}[] = [],
            lines: string[] = []
        ;
        let defaultNamespace = 'minecraft';
        
        let currentFunction: string | undefined;

        if(spacesToTabs) text = text.replaceAll(' '.repeat(spacesToTabs), '\t');

        macros = new Map([...macros.entries()].filter(([key]) => /^[A-Z_]*$/.test(key)));

        text.replace(/(?:(?:(?<!\\)(?:\\{2})*\\\n)|[^\n])*/g, match => lines.push(match).toString());

        function expandMacros(text: string): string {
            return [...macros.entries()].reduce((text, [macro, value]) => text.replaceAll('$'+macro,value), text);
        }

        for(const line of lines) {
            let $: RegExpExecArray | null;
            if($ = /^\s*?##\s*?(?:define|def)\s*?\$?(?<macro>[A-Z_]+)(?: (?<value>(?:(?:(?<!\\)(?:\\{2})*\\\n)|[^\n])*))?/gm.exec(line)) conditions.every(c=>c()) ? macros.set($.groups!.macro, $.groups!.value?.replace(/\\(?=\n)/g, '')?.replaceAll(BACKSLASH.repeat(2), BACKSLASH) ?? '') : 0;
            else if($ = /^\s*?##\s*?un(?:define|def)\s*?\$?(?<macro>[A-Z_]+)\s*?$/gm.exec(line)) conditions.every(c=>c()) ? macros.delete($.groups!.macro) : 0;
            else if($ = /^(?<whitespace>\s*?)##\s*?(?:js|javascript)\s*?(?<value>[\s\S]*)/gm.exec(line)) conditions.every(c=>c()) ? (await evalFunction($.groups?.value?.replace(/\\(?=\n)/g, '')?.replaceAll(BACKSLASH.repeat(2), BACKSLASH) ?? '') ?? '').toString().split(/\n/g).forEach((line: string)=>interpretLine($!.groups!.whitespace + line)) : 0;
            else if($ = /^\s*?##\s*?if(?:def|defined)\s*?\$?(?<macro>[A-Z_]+)\s*?$/gm.exec(line)) conditions.push(() => [...macros.keys()].includes($!.groups!.macro));
            else if($ = /^\s*?##\s*?if\s+?(?<lhs>(?:(?:(?<!\\)(?:\\{2})*\\\n)|[^\n])*)\s+?(?:(?<not>!)?=)\s+?(?<rhs>(?:(?:(?<!\\)(?:\\{2})*\\\n)|[^\n])*)\s*?$/gm.exec(line)) conditions.push(() => (!!$!.groups!.not) !== (expandMacros(($!.groups!.lhs??'').trim()) === expandMacros(($!.groups!.rhs??'').trim())));
            else if($ = /^\s*?##\s*?ifun(?:def|defined)\s*?\$?(?<macro>[A-Z_]+)\s*?$/gm.exec(line)) conditions.push(() => ![...macros.keys()].includes($!.groups!.macro));
            else if($ = /^\s*?##\s*?endif\s*?$/gm.exec(line)) conditions.pop();
            else if($ = /^\s*?##\s*?(?:warn|alert) (?<value>(?:(?:(?<!\\)(?:\\{2})*\\\n)|[^\n])*)\s*?$/gm.exec(line)) conditions.every(c=>c()) ? warn(expandMacros($!.groups!.value)) : 0;
            else if($ = /^\s*?##\s*?(?:msg|info) (?<value>(?:(?:(?<!\\)(?:\\{2})*\\\n)|[^\n])*)\s*?$/gm.exec(line)) conditions.every(c=>c()) ? info(expandMacros($!.groups!.value)) : 0;
            else if($ = /^\s*?##\s*?(?:fail|error)(?: (?<value>(?:(?:(?<!\\)(?:\\{2})*\\\n)|[^\n])*))?\s*?$/gm.exec(line)) conditions.every(c=>c()) ? (()=>{throw expandMacros($!.groups!.value) ?? 'Error macro called'})() : 0
            else if($ = /^\s*?##[\s\S]*/gm.exec(line)) throw `Unexpected macro instruction "${$[0]}" on line ${lines.slice(0, lines.indexOf(line)).reduce((n, line) => n + line.split(/\n/g).length, 0)}`;
            else if(conditions.every(c=>c())) interpretLine(expandMacros(line).replace(/\\\n/g, '').replaceAll(BACKSLASH.repeat(2), BACKSLASH));
        }
        
        function interpretLine(line: string) {
            let level = /^\t*/.exec(line)?.[0]?.length ?? 0, $: RegExpExecArray | null;
            if(/^(?:\s*$)|(\s*?#)/g.test(line)) return;
            else if(level === 0) {
                if($ = /^fn (?:(?<namespace>[a-z_]+):)?(?<name>[a-z_]+)(?: on (?<tags>(?:(?:[a-z_]:)?[a-z_]+, ?)*(?:[a-z_]+)))?:\s*?$/.exec(line)) {
                    currentFunction = ($!.groups!.namespace ?? defaultNamespace) + ':' + $!.groups!.name;
                    for(const tag of ($!.groups!.tags ?? '').split(',').map(t=>t.trim()).filter(t=>t)) {
                        tags.set(tag, [...(tags.get(tag) ?? []), currentFunction!]);
                    }
                    exports.set(currentFunction, []);
                    instructions.splice(1,instructions.length-1);
                }
                else if($ = /^namespace (?<namespace>[a-z_]+)$/.exec(line)) {
                    defaultNamespace = $!.groups!.namespace;
                }
                else throw `Indentation level ${level} may only contain function or namespace declarations.`;
            }
            else if(!currentFunction) throw 'Unexpected instruction before function declaration';
            else if($ = /^(?<tabs>\t*?)(?<what>(?:align|anchored|as|at|facing|in|positioned|rotated|store|if|unless)[\s\S]*):\s*?$/gm.exec(line)) {
                instructions.splice(level, instructions.length - level, $!.groups!.what);
            }
            else {
                instructions.splice(level, instructions.length);
                if(instructions.length < level) throw `Unexpected indentation level ${level}`;
                exports.get(currentFunction)!.push(instructions.length > 1 ? `${[...instructions, 'run'].join(' ')} ${line.trim()}` : line.trim());
            }
        }

        return {functions: new Map<string, string>([...exports.entries()].map(([key,value])=>[key,value.join('\n')])), tags, defaultNamespace, macros};
    }
}
