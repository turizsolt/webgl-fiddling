window.addEventListener('DOMContentLoaded', () => {
    let framesElapsed = 0;

    const createGround = function (scene) {
        const halfsize = 5;
        const size = 9;

        const ground = new BABYLON.Mesh('ground', scene);
        const color = new BABYLON.Color3(0, 0.6, 0);

        const sqrt3 = Math.sqrt(3);
        const unit = 10;
        const halfunit = 5;
        const zunit = unit * sqrt3 / 2;

        const ptc = function (x, z) {
            px = -(unit * halfsize) + (x * unit) + ((z % 2 == 0) ? 0 : halfunit);
            pz = -(zunit * halfsize) + (z * zunit);
            h = terrain[x][z].h * unit;

            return [px, h, pz];
        }

        const positions = [];
        const normals = [];
        const indices = [];
        var indicesCount = 0;
        const colors = [];
        for (let z = 0; z < size; z++) {
            for (let x = 0; x < size; x++) {

                if (z % 2 === 0) {
                    positions.push(...ptc(x, z));
                    positions.push(...ptc(x + 1, z));
                    positions.push(...ptc(x, z + 1));

                    positions.push(...ptc(x + 1, z));
                    positions.push(...ptc(x + 1, z + 1));
                    positions.push(...ptc(x, z + 1));
                } else {
                    positions.push(...ptc(x, z));
                    positions.push(...ptc(x + 1, z + 1));
                    positions.push(...ptc(x, z + 1));

                    positions.push(...ptc(x, z));
                    positions.push(...ptc(x + 1, z));
                    positions.push(...ptc(x + 1, z + 1));
                }

                for (var i = 0; i < 6; i++) normals.push(0, 1, 0);

                for (var i = 0; i < 6; i++) indices.push(indicesCount + i);
                indicesCount += 6;

                const tint = Math.random() * 0.05;
                for (var i = 0; i < 3; i++) colors.push(color.r + tint, color.g + tint, color.b + tint, 1);
                const tint2 = Math.random() * 0.05;
                for (var i = 0; i < 3; i++) colors.push(color.r + tint2, color.g + tint2, color.b + tint2, 1);
            }
        }

        ground.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true);
        ground.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals, true);
        ground.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors, true);
        ground.setIndices(indices);

        const groundMaterial = new BABYLON.StandardMaterial("material", scene);
        groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        ground.material = groundMaterial;
        // groundMaterial.wireframe = true;

        return ground;
    }

    const canvas = document.getElementById('render-canvas');
    const fpsLabel = document.getElementById("fps-label");
    const renderEngine = new BABYLON.Engine(canvas, true);
    const createScene = () => {
        const scene = new BABYLON.Scene(renderEngine);

        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, new BABYLON.Vector3(0, 0, 0));
        camera.attachControl(canvas, true);
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));
        const ground = createGround(scene);
        return { scene };
    }

    const { scene } = createScene();

    renderEngine.runRenderLoop(() => {
        scene.render();

        framesElapsed++;
        if (framesElapsed % 100 === 0) {
            fpsLabel.innerHTML = renderEngine.getFps().toFixed() + " fps";
        }
    });

    window.addEventListener("resize", function () {
        renderEngine.resize();
    });
});
