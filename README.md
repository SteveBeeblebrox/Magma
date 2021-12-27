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
## Execute Syntax
## Comment Syntax
Comments are the same as in a plain Minecraft function. Lines starting with a `#` are ignored.
