# Magma
A transpiler for Minecraft functions
## Introduction

## Macro Instructions
Magma has several different macro instructions to assist in generating code. Lines starting with `##` are treated as macro instructions. Unknown instructions throw an error.
### `define <name> [value]` or `def <name> [value]`
The `define` macro instruction will replace any instances of `name` with `value`. If not given, `value` is an empty string. `name` must be composed of only the characters `A-Z_`.
```bash
## define MATERIAL diamond
fn demo:
  give @s MATERIAL_sword
  give @s MATERIAL_axe
```
### `undefine <name>` or `undef <name>`
Prevents further replacement of `name`.
```bash
## define TEXT Hello World
fn demo:
  say TEXT
## undefine TEXT
  say Just the plain word TEXT
```
### `ifdefined <name>` or `ifdef <name>`
Outputs the following lines up until an `endif` macro instruction only if the given `name` is defined using the `define` macro instruction. `ifdefined` can be nested.
```bash
## define DEBUG
fn demo:
## ifdef DEBUG
  say Doing stuff
## endif
```
### `ifundefined <name>` or `ifundef <name>`
```bash
## define MARKER_SUPPORT
fn demo:
## ifdef MARKER_SUPPORT
  summon marker ~ ~ ~ {}
## endif
## ifundef MARKER_SUPPORT
  summon area_effect_cloud ~ ~ ~ {}
## endif
```
### `javascript <text>` or `js <text>`
The `javascript` macro instruction evaluates the given text and includes the result in program. Each line output recieves the same indentation as the macro instruction.
```javascript
fn demo:
  ## javascript 'axe,sword,shovel,pickaxe'.split(',').map(i => 'give @s diamond_' + i).join('\n')
```
## Function Syntax
Scripting must be done inside of a function declaration. Only comments and macro instructions may appear outside of functions. Input to Magma can contain more than one function to be parsed. Functions are defined at the top indentation level by using the `fn` keyword followed by the name of the function and a colon. Function names must contain only `a-z0-9_`. All indented lines until the next function declaration or end of the file are considered part of this function and treated as an instruction. To make one instruction span multiple lines, use a `\` to escape the new line. To include an actual `\` in a function, you must escape it like this `\\`. Magma does not validate commands so that it will work with modded environments. **Note that Magma uses tabs for indentation; however, the `transpile` function may be passed a object as second argument. This object may contain the property `spacesToTabs` which will cause n spaces to be treated as a tab.**
```bash
fn on_tick:
  effect give @e glowing

fn on_load:
  say Loading...
  
  say Lorem Ipsum
```
## Execute Syntax
Magama makes it easier to write `execute` commands by providing a Python-like syntax for the command to reduce repetition and improve readability. Lines starting with either `align`, `anchored`, `as`, `at`, `facing`, `in`, `positioned`, `rotated`, `store`, `if`, or `unless` start an execute block. Execute blocks may be stacked. Each instruction in an execute block (indented one more level following it) will recieve all the prior execution blocks prepended to it as wellas the needed `execute` and `run` portions of the command. Magma will not prepend unneded/empty execute commands.

```bash
fn load:
  say Loading...
  as @e:
    at @s:
      if block ~ ~ ~ water:
        say I'm in water! 
```
## Comment Syntax
Comments are the same as in a plain Minecraft function. Lines starting with a `#` are ignored.
