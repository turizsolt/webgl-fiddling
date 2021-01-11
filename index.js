window.addEventListener('DOMContentLoaded', () => {
    const count = 100;
    const objects = [];
    for (let i = 0; i < count; i++) {
        objects.push({
            position: { x: 0, y: 0, z: 0 },
            radius: 1,
            rotation: 0,
            speed: 1
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
        const box = BABYLON.MeshBuilder.CreateBox("box", {});
        return { scene, box };
    }

    const { scene, box } = createScene();

    renderEngine.runRenderLoop(() => {
        scene.render();
        fpsLabel.innerHTML = renderEngine.getFps().toFixed() + " fps";

        framesElapsed++;
        const rot = objects[0].rotation + objects[0].speed * framesElapsed / Math.PI / 10;
        box.position.x = objects[0].position.x + objects[0].radius * Math.sin(rot);
        box.position.y = objects[0].position.y - objects[0].radius * Math.cos(rot);
        box.position.z = objects[0].position.z;
    });

    window.addEventListener("resize", function () {
        engine.resize();
    });
});
