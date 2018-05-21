# External C Module Support in BoneScript


## Introduction 

This is a collection of examples to demonstrate the External C Module Support functionality in BoneScript. Each example folder includes a README with detailed instructions for getting up and running with the particular example.

## Functions Documentation 

### mraaGPIO(pin)

* `return`: (string)the corresponding MRAA GPIO Pin Number corresponding to the pin.

### writeCModule(filename,code,callback)

Will write a C program with Source code provided in the code input at the filename path.

* `filename`: (string)complete path of the file to be written(with or without .c extension).
* `code`: (string)the source code to be written.
* `callback`: (function)called upon completion.

### loadCModule(pathtoCfile,fnName&arguments,isMRAA)

Loads a function from the C program provided at the path with Function name and arguments in the fnName&arguments input

* `pathtoCfile`: (string)complete path of the file from which the function is to be loaded(with or without .c extension).
* `fnName&arguments`: (object)contains the to be loaded functions name and input/output arguments in the format 

```
{function_name : [ 'outArgType' , [ 'inArg1Type',inArg2Type',...]]}

function_name(string) corresponds to the name of the function to be loaded.
outArgType(string) corresponds to the output argument type of the function loaded.
inArgType(string) corresponds to the input arguments type of the function loaded.
```

* `isMRAA`: (boolean)whether to link link mraa headers during compilation(default : false).

* `return`: (object)the function loaded corresponding to the input provided.


## Example Usage

```

var b = require('bonescript');

var code = `
#include <stdio.h>
int main(int argc)
{
   printf("Hello, World!");
   return 0;
}
`; //code enclosed between ``

var args = {
    'main': ['int', ['int']]
};
var w = b.writeCModule('./example', code);
var x = b.loadCModule('./example', args, false);
x.main(1, function (err, res) {}); //default sync usage
x.main.async(1, function (err, res) {}); //async usage

```







