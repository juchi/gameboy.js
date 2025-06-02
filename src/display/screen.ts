// Screen device
class Screen {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    pixelSize: number;
    imageData: ImageData;

    constructor(canvas: HTMLCanvasElement, pixelSize: number) {
        this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.canvas = canvas;
        this.pixelSize = pixelSize || 1;
        this.initImageData();
    }

    // Palette colors (RGB)
    static colors = [
        [0xFF, 0xFF, 0xFF],
        [0xAA, 0xAA, 0xAA],
        [0x55, 0x55, 0x55],
        [0x00, 0x00, 0x00]
    ];

    static physics = {
        WIDTH    : 160,
        HEIGHT   : 144,
        FREQUENCY: 60
    };

    setPixelSize(pixelSize: number) {
        this.pixelSize = pixelSize;
        this.initImageData();
    }

    initImageData() {
        this.canvas.width = Screen.physics.WIDTH * this.pixelSize;
        this.canvas.height = Screen.physics.HEIGHT * this.pixelSize;
        this.imageData = this.context.createImageData(this.canvas.width, this.canvas.height);
        for (var i = 0; i < this.imageData.data.length; i++) {
            this.imageData.data[i] = 255;
        }
    }

    clearScreen() {
        this.context.fillStyle = '#FFF';
        this.context.fillRect(0, 0, Screen.physics.WIDTH * this.pixelSize, Screen.physics.HEIGHT * this.pixelSize);
    }

    fillImageData(buffer) {
        for (var y = 0; y < Screen.physics.HEIGHT; y++) {
            for (var py = 0; py < this.pixelSize; py++) {
                var yOffset = (y * this.pixelSize + py) * this.canvas.width;
                for (var x = 0; x < Screen.physics.WIDTH; x++) {
                    for (var px = 0; px < this.pixelSize; px++) {
                        var offset = yOffset + (x * this.pixelSize + px);
                        var v = Screen.colors[buffer[y * Screen.physics.WIDTH + x] | 0];
                        // set RGB values
                        this.imageData.data[offset * 4] = v[0];
                        this.imageData.data[offset * 4 + 1] = v[1];
                        this.imageData.data[offset * 4 + 2] = v[2];
                    }
                }
            }
        }
    }

    render(buffer) {
        this.fillImageData(buffer);
        this.context.putImageData(this.imageData, 0, 0);
    }
}

export default Screen;
