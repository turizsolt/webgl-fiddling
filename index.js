window.addEventListener('DOMContentLoaded', () => {
    const count = 6000;
    const objects = [];
    for (let i = 0; i < count; i++) {
        objects.push({
            position: { x: Math.random() * 100 - 50, y: Math.random() * 100 - 50, z: 0 },
            radius: 5 + Math.random() * 20,
            rotation: Math.random() * Math.PI * 2,
            speed: Math.random() * 2
        });
    }
    let framesElapsed = 0;

    const canvas = document.getElementById('render-canvas');
    const fpsLabel = document.getElementById("fps-label");
    const renderEngine = new BABYLON.Engine(canvas, true);
    const createScene = () => {
        const scene = new BABYLON.Scene(renderEngine);

        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0));
        camera.attachControl(canvas, true);
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));
        const boxMesh = BABYLON.MeshBuilder.CreateBox("box", {});
        const boxes = [];
        for (let i = 0; i < count; i++) {
            boxes.push(boxMesh.createInstance());
        }
        return { scene, boxes };
    }

    const { scene, boxes } = createScene();

    renderEngine.runRenderLoop(() => {
        scene.render();

        framesElapsed++;
        if (framesElapsed % 100 === 0) {
            fpsLabel.innerHTML = renderEngine.getFps().toFixed() + " fps";
        }

        for (let i = 0; i < count; i++) {
            const rot = objects[i].rotation + objects[i].speed * framesElapsed / Math.PI / 10;
            boxes[i].position.x = objects[i].position.x + objects[i].radius * Math.sin(rot);
            boxes[i].position.y = objects[i].position.y - objects[i].radius * Math.cos(rot);
            boxes[i].position.z = objects[i].position.z;
        }
    });

    window.addEventListener("resize", function () {
        renderEngine.resize();
    });
});
