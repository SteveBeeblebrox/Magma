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
Scripting must be done inside of a function declaration. Input to Magma can contain more than one function to be parsed. Functions are defined at the top indentation level by using the `fn` keyword followed by the name of the function and a colon. All indented lines until the next function declaration or end of the file are considered part of this function. Function names must contain only `a-z0-9_`. Only comments and macro instructions may appear outside of functions. Functions may have blank lines inside of them to improve readability.
```bash
fn on_tick:
  effect give @e glowing

fn on_load:
  say Loading...
  
  say Lorem Ipsum
```
## Execute Syntax
## Comment Syntax
Comments are the same as in a plain Minecraft function. Lines starting with a `#` are ignored.
