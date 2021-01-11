window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('render-canvas');
    const fpsLabel = document.getElementById("fps-label");

    const renderEngine = new BABYLON.Engine(canvas, true);
    const createScene = () => {
        const scene = new BABYLON.Scene(renderEngine);

        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0));
        camera.attachControl(canvas, true);
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));
        const box = BABYLON.MeshBuilder.CreateBox("box", {});
        return scene;
    }

    const scene = createScene();

    renderEngine.runRenderLoop(() => {
        scene.render();
        fpsLabel.innerHTML = renderEngine.getFps().toFixed() + " fps";
    });
});
