console.clear()
const tab = '\t'
const test = String.raw`
# Comment
fn load:
## javascript '\tgive @s apple'

##def FULL_STACK 64

    give @s diamond FULL_STACK

## undef FULL_STACK

## ifdef DEV
    say Hello Dev World
## endif
## ifundef DEV
    say Hello Production World
##endif
    as @e:
        say Welcome!
        positioned 0 0 0:
            if lorem ipsum:
                setblock ~ ~ ~ air
        setblock ~ ~ ~ stone
        setblock ~ ~ ~ diamond_block

fn tick:
    particle idk

fn tick:
    as @e:
        particle but better
    particle ...
`.replace(/\\t/g,'\t')

function preprocess(text: string, spacesToTabs = 0): string[] {
    if(spacesToTabs) text = text.replaceAll(' '.repeat(spacesToTabs), '\t')
    const BACKSLASH = '\\';
    const macros = new Map<string, string>();
    const lines: string[] = [];
    text.replace(/(?:(?:(?<!\\)(?:\\{2})*\\\n)|[^\n])*/g, match => lines.push(match).toString());
    let output: string[] = [], conditions: {(): boolean}[] = [];

    for(const line of lines) {
        let $: RegExpExecArray | null;
        if($ = /^\s*?##\s*?(?:define|def)\s*?(?<macro>[A-Z_]+)(?: (?<value>(?:(?:(?<!\\)(?:\\{2})*\\\n)|[^\n])*))?/gm.exec(line))  macros.set($.groups!.macro, $.groups!.value?.replace(/\\(?=\n)/g, '')?.replaceAll(BACKSLASH.repeat(2), BACKSLASH) ?? '');
        else if($ = /^\s*?##\s*?un(?:define|def)\s*?(?<macro>[A-Z_]+)\s*?$/gm.exec(line))  macros.delete($.groups!.macro);
        else if($ = /^\s*?##\s*?(?:js|javascript)\s*?(?<value>[\s\S]*)/gm.exec(line)) (eval($.groups?.value?.replace(/\\(?=\n)/g, '')?.replaceAll(BACKSLASH.repeat(2), BACKSLASH) ?? '') ?? '').toString().split(/\n/g).forEach((line: string)=>output.push(line));
        else if($ = /^\s*?##\s*?if(?:def|defined)\s*?(?<macro>[A-Z_]+)\s*?$/gm.exec(line)) conditions.push(() => [...macros.keys()].includes($!.groups!.macro));
        else if($ = /^\s*?##\s*?ifun(?:def|defined)\s*?(?<macro>[A-Z_]+)\s*?$/gm.exec(line)) conditions.push(() => ![...macros.keys()].includes($!.groups!.macro));
        else if($ = /^\s*?##\s*?endif\s*?$/gm.exec(line)) conditions.pop();
        else if($ = /^\s*?##[\s\S]*/gm.exec(line)) throw (`Unexpected macro instruction "${$[0]}" on line ${lines.slice(0, lines.indexOf(line)).reduce((n, line) => n + line.split(/\n/g).length, 0)}`);
        else if(conditions.every(c=>c())) output.push([...macros.entries()].reduce((line, [macro, value]) => line.replaceAll(macro,value), line).replace(/\\\n/g, '').replaceAll(BACKSLASH.repeat(2), BACKSLASH));
    }

    return output;
}

function transpile(text: string) {
    const lines = preprocess(text, 4).filter(line => !/^(?:\s*$)|(\s*?#)/g.test(line));
    const exports = new Map<string, string[]>();
    let currentFunction: string | undefined

    const instructions: string[] = ['execute']

    for(const line of lines) {
        let level = /^\t*/.exec(line)?.[0]?.length ?? 0, $: RegExpExecArray | null;
        if(level === 0) {
            if($ = /^fn (?<name>[a-z_]+):/.exec(line)) {
                currentFunction = $!.groups!.name
                exports.set(currentFunction, [])
                instructions.splice(1,instructions.length-1)
            }
            else throw `Indentation level ${level} may only contain function declarations.`
        }
        else if(!currentFunction) throw 'Unexpected instruction before function declaration'
        else if($ = /^(?<tabs>\t*?)(?<what>(?:align|anchored|as|at|facing|in|positioned|rotated|store|if|unless)[\s\S]*):\s*?$/gm.exec(line)) {
            instructions.splice(level, instructions.length - level, $!.groups!.what)
        }
        else {
            instructions.splice(level, instructions.length)
            if(instructions.length < level) throw `Unexpected indentation level ${level}`
            exports.get(currentFunction)!.push(instructions.length > 1 ? `${[...instructions, 'run'].join(' ')} ${line.trim()}` : line.trim())
        }
    }

    return new Map<string, string>([...exports.entries()].map(([key,value])=>[key,value.join('\n')]))
}

console.log(transpile(test))
