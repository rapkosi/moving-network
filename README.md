# Moving Network
[![MIT License](https://img.shields.io/badge/licence-MIT-006fdd.svg)](https://opensource.org/licenses/mit-license.php) 

There is a minified version and source version of the script.

The source file is written in ECMAScript 2015 (ES6). ES6 is not 
fully supported in every browser so it is recommended to use
the minified version, which is compiled to ES5. 

## Use the Script
First, define an element with a canvas element in it where you want to use
the network pattern. Give both an ID. You can give the parent element a width 
and height. The canvas will automatically fill it up. 
```HTML
<div id="myParentElement">
    <canvas id="myCanvas"></canvas>
</div>
```

Second, import the Script to the page where you want to have the network pattern and
give the network the canvas ID, the parent ID, and the network color; and render it.
```HTML
<script src="path/to/script/network.min.js" type="text/javascript"></script>
<script type="text/javascript">
    nwSetup.canvasId = 'myCanvas';
    nwSetup.parentId = 'myParentElement';
    nwSetup.networkColor = '#333333';

    nwRender()
</script>
```

## Modify the Network
The network has three required parameters:
```JavaScript
    nwSetup.canvasId      // string with canvas ID
    nwSetup.parentId      // string with parent ID
    nwSetup.networkColor  // string with color value in HEX
```

For further customizability, optional parameters can be set:
```JavaScript
    nwSetup.interactive         // boolean to turn mouse interaction on or off (default: true)
    nwSetup.backgroundColor     // string with color value in HEX (default: #FFFFFF)
    nwSetup.nodeRadius          // number to define node radius (default: 2)
    nwSetup.lineWidth           // number to define line width (default: 0.8)
```

## Copyright and license 
Code copyright 2020 [Raphael Koch](https://raphaelkoch.com). Code release under the
 [MIT License](LICENSE.md).