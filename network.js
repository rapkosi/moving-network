/*!
 * @file Creates a moving network pattern
 * @copyright Raphael Koch 2020
 */
class nw {
    constructor(
        canvasId,
        parentId,
        networkColor,
        interactive = true,
        networkBackground = '#FFFFFF',
        nodeRadius = 2,
        lineWidth = 0.8
    ) {
        this.canvasId = canvasId;
        this.parentId = parentId;
        this.nodeRadius = nodeRadius;
        this.lineWidth = lineWidth;
        this.interactive = interactive;

        if (
            typeof networkColor === 'string'
            && ( 
                networkColor.length === 7
                && networkColor.startsWith('#')
                && !isNaN(Number('0x' + networkColor.substr(1,6)))
            ||
                networkColor.length === 6
                && !isNaN(Number('0x' + networkColor))
            )
        ) {
            let c;
            if (networkColor.startsWith('#')) {
                c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(networkColor)
            } else {
                c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec('#'+networkColor)
            }
            this.networkColor = c ? {
                r: parseInt(c[1], 16),
                g: parseInt(c[2], 16),
                b: parseInt(c[3], 16)
            } : console.error('Parsing the HEX value failed');
        }
        else {
            console.error('The given network color is not a HEX value');
        }

        if (
            typeof networkBackground === 'string'
            && ( 
                networkBackground.length === 7
                && networkBackground.startsWith('#')
                && !isNaN(Number('0x' + networkBackground.substr(1,6)))
            ||
                networkBackground.length === 6
                && !isNaN(Number('0x' + networkBackground))
            )
        ) {
            let c;
            if (networkBackground.startsWith('#')) {
                c = networkBackground;
            } else {
                c = '#'+networkBackground;
            }
            this.networkBackground = c;
        }
        else {
            console.error('The given background color is not a HEX value');
        }
    }

    render() {
        // Get elements from document
        const cnv = document.getElementById(this.canvasId),
            parent = document.getElementById(this.parentId),
            ctx = cnv.getContext('2d'),
            norm = 25000;
        let cnv_w = parseInt(cnv.getAttribute('width')),
            cnv_h = parseInt(cnv.getAttribute('height'));

        // Network setup
        const node_color = {
                r: this.networkColor.r,
                g: this.networkColor.g,
                b: this.networkColor.b
            },
            R = this.nodeRadius,
            edge_width = this.lineWidth,
            edge_color = {
                r: this.networkColor.r,
                g: this.networkColor.g,
                b: this.networkColor.b
            },
            bg_color = this.networkBackground,
            alpha_f = 0.03,
            alpha_phase = 0,
            dis_limit = 260;
        let node = {
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                r: 0,
                alpha: 1,
                phase: 0
            },
            nodes = [],
            add_mouse_point = true,
            mouse_in = false,
            mouse_node = {
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                r: 0,
                type: 'mouse'
            };

        // Return a random speed
        function getRandomSpeed(pos) {
            let min = -1,
                max = 1;
            switch (pos) {
                case 'top':
                    return [randomNumFrom(min, max), randomNumFrom(0.1, max)];
                case 'right':
                    return [randomNumFrom(min, -0.1), randomNumFrom(min, max)];
                case 'bottom':
                    return [randomNumFrom(min, max), randomNumFrom(min, -0.1)];
                case 'left':
                    return [randomNumFrom(0.1, max), randomNumFrom(min, max)];
                default:
                    return;
            }
        }

        // Return a node at a random position
        function getRandomNode() {
            let pos = randomArrayItem(['top', 'right', 'bottom', 'left']);
            switch (pos) {
                case 'top':
                    return {
                        x: randomSidePos(cnv_w),
                        y: -R,
                        vx: getRandomSpeed('top')[0],
                        vy: getRandomSpeed('top')[1],
                        r: R,
                        alpha: 1,
                        phase: randomNumFrom(0, 10)
                    }
                case 'right':
                    return {
                        x: cnv_w + R,
                        y: randomSidePos(cnv_h),
                        vx: getRandomSpeed('right')[0],
                        vy: getRandomSpeed('right')[1],
                        r: R,
                        alpha: 1,
                        phase: randomNumFrom(0, 10)
                    }
                case 'bottom':
                    return {
                        x: randomSidePos(cnv_w),
                        y: cnv_h + R,
                        vx: getRandomSpeed('bottom')[0],
                        vy: getRandomSpeed('bottom')[1],
                        r: R,
                        alpha: 1,
                        phase: randomNumFrom(0, 10)
                    }
                case 'left':
                    return {
                        x: -R,
                        y: randomSidePos(cnv_h),
                        vx: getRandomSpeed('left')[0],
                        vy: getRandomSpeed('left')[1],
                        r: R,
                        alpha: 1,
                        phase: randomNumFrom(0, 10)
                    }
            }
        }

        // Draw Nodes
        function renderNodes() {
            Array.prototype.forEach.call(nodes, function (b) {
                if (!b.hasOwnProperty('type')) {
                    ctx.fillStyle = 'rgba(' + node_color.r + ',' + node_color.g + ',' + node_color.b + ',' + b.alpha + ')';
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, R, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.fill();
                }
            });
        }

        // Update nodes
        function updateNodes() {
            let new_nodes = [];
            Array.prototype.forEach.call(nodes, function (b) {
                b.x += b.vx;
                b.y += b.vy;

                if (b.x > -(50) && b.x < (cnv_w + 50) && b.y > -(50) && b.y < (cnv_h + 50)) {
                    new_nodes.push(b);
                }

                // alpha change
                b.phase += alpha_f;
                b.alpha = Math.abs(Math.cos(b.phase));
                // console.log(b.alpha);
            });

            nodes = new_nodes.slice(0);
        }

        // Draw lines
        function renderLines() {
            let fraction, alpha;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {

                    fraction = getDisOf(nodes[i], nodes[j]) / dis_limit;

                    if (fraction < 1) {
                        alpha = (1 - fraction).toString();
                        ctx.strokeStyle = 'rgba(' + edge_color.r + ',' + edge_color.g + ',' + edge_color.b + ',' + alpha + ')';
                        ctx.lineWidth = edge_width;

                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
            }
        }

        // add nodes if there a little nodes
        function addNodeIfy() {
            if (nodes.length < (cnv.width * cnv.height / (norm))) {
                nodes.push(getRandomNode());
            }
        }

        // Render
        function render() {
            ctx.clearRect(0, 0, cnv_w, cnv_h);
            ctx.fillStyle = bg_color;
            ctx.fillRect(0, 0, cnv_w, cnv_h);
            renderNodes();
            renderLines();
            updateNodes();
            addNodeIfy();
            window.requestAnimationFrame(render);
        }

        // Init Nodes
        function initNodes(num) {
            for (let i = 1; i <= num; i++) {
                nodes.push({
                    x: randomSidePos(cnv_w),
                    y: randomSidePos(cnv_h),
                    vx: getRandomSpeed('top')[0],
                    vy: getRandomSpeed('top')[1],
                    r: R,
                    alpha: 1,
                    phase: randomNumFrom(20, 50)
                });
            }
        }
        // Init Canvas
        function initCanvas() {
            cnv.setAttribute('width', parent.clientWidth);
            cnv.setAttribute('height', parent.clientHeight);

            cnv_w = parseInt(cnv.getAttribute('width'));
            cnv_h = parseInt(cnv.getAttribute('height'));
        }
        // Call canvas init on resize
        window.addEventListener('resize', function (e) {
            initCanvas();
        });

        function startNetwork() {
            initCanvas();
            initNodes((cnv.width * cnv.height / (norm)));
            window.requestAnimationFrame(render);
        }
        startNetwork();

        // Mouse effect
        if (this.interactive) {
            parent.addEventListener('mouseenter', function () {
                mouse_in = true;
                nodes.push(mouse_node);
            });
            parent.addEventListener('mouseleave', function () {
                mouse_in = false;
                let new_nodes = [];
                Array.prototype.forEach.call(nodes, function (b) {
                    if (!b.hasOwnProperty('type')) {
                        new_nodes.push(b);
                    }
                });
                nodes = new_nodes.slice(0);
            });
            parent.addEventListener('mousemove', function (ev) {
                const e = ev || window.event;
                mouse_node.x = e.pageX;
                mouse_node.y = e.pageY;
            });
        }

        //=======================================================================//
        // Helper functions
        //

        function randomArrayItem(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }
        function randomNumFrom(min, max) {
            return Math.random() * (max - min) + min;
        }
        function randomSidePos(length) {
            return Math.ceil(Math.random() * length);
        }
        // calculate distance between two points
        function getDisOf(b1, b2) {
            var delta_x = Math.abs(b1.x - b2.x),
                delta_y = Math.abs(b1.y - b2.y);

            return Math.sqrt(delta_x * delta_x + delta_y * delta_y);
        }
    }
}

const nwSetup = {
    canvasId: '',
    parentId: '',
    networkColor: '',
    interactive: true,
    backgroundColor: '#FFFFFF',
    nodeRadius: 2,
    lineWidth: 0.8
}

function nwRender () {
    (new nw(
        nwSetup.canvasId, 
        nwSetup.parentId,
        nwSetup.networkColor,
        nwSetup.interactive,
        nwSetup.backgroundColor,
        nwSetup.nodeRadius,
        nwSetup.lineWidth
        )).render()
}