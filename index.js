window.addEventListener('DOMContentLoaded', () => {
    let framesElapsed = 0;

    const createGround = function (scene) {
        const halfsize = 8;
        const size = 16;

        const ground = new BABYLON.Mesh('ground', scene);
        const baseColor = new BABYLON.Color3(0, 0.6, 0);
        const hillColor = new BABYLON.Color3(0.63, 0.46, 0.18);

        const sqrt3 = Math.sqrt(3);
        const unit = 10;
        const halfunit = 5;
        const zunit = unit * sqrt3 / 2;

        const ptc = function (x, z) {
            px = -(unit * halfsize) + (x * unit) + (z * halfunit);
            pz = -(zunit * halfsize) + (z * zunit);
            h = terrain[x][z].h * unit;

            return [px, h, pz];
        }

        for (let x = 0; x < size; x++) {
            for (let z = 0; z < size; z++) {
                terrain[x][z].utri = 1;
                terrain[x][z].btri = 1;
                // if (x < size && z < size) {
                terrain[x][z].uint = terrain[x][z].int | terrain[x + 1][z].int | terrain[x][z + 1].int;
                terrain[x][z].bint = terrain[x + 1][z + 1].int | terrain[x + 1][z].int | terrain[x][z + 1].int;
                // }
            }
        }

        /*

        // upper
        for (let x = 0; x < size; x += 2) {
            for (let z = 0; z < size; z += 2) {
                // if mind a 4 egyes
                if (terrain[x][z].bint === 0) {
                    terrain[x][z].utri = 2;

                    terrain[x + 1][z].utri = 0;
                    terrain[x][z + 1].utri = 0;
                    terrain[x][z].btri = 0;

                    terrain[x][z].uint = terrain[x][z].uint | terrain[x + 1][z].uint | terrain[x][z + 1].uint;
                }
            }
        }

        // below
        for (let x = 1; x < size; x += 2) {
            for (let z = 1; z < size; z += 2) {
                // if mind a 4 egyes
                if (terrain[x][z].uint === 0) {
                    terrain[x][z].btri = 2;

                    terrain[x - 1][z].btri = 0;
                    terrain[x][z - 1].btri = 0;
                    terrain[x][z].utri = 0;

                    terrain[x][z].bint = terrain[x][z].bint | terrain[x - 1][z].bint | terrain[x][z - 1].bint;
                }
            }
        }

        */

        for (let k = 2; k < 8; k *= 2) {
            let hk = k / 2;

            for (let x = 0; x < size; x += k) {
                for (let z = 0; z < size; z += k) {
                    if (terrain[x][z].utri === hk &&
                        terrain[x + hk][z].utri === hk &&
                        terrain[x][z + hk].utri === hk &&
                        terrain[x + hk - 1][z + hk - 1].btri === hk) {
                        if (terrain[x + hk - 1][z + hk - 1].bint === 0) {
                            terrain[x][z].utri = k;

                            terrain[x + hk][z].utri = 0;
                            terrain[x][z + hk].utri = 0;
                            terrain[x + hk - 1][z + hk - 1].btri = 0;

                            terrain[x][z].uint = terrain[x][z].uint | terrain[x + hk][z].uint | terrain[x][z + hk].uint;
                        }
                    }
                }
            }

            for (let x = k - 1; x < size; x += k) {
                for (let z = k - 1; z < size; z += k) {
                    if (terrain[x][z].btri === hk &&
                        terrain[x - hk][z].btri === hk &&
                        terrain[x][z - hk].btri === hk &&
                        terrain[x + 1 - hk][z + 1 - hk].utri === hk) {
                        if (terrain[x + 1 - hk][z + 1 - hk].uint === 0) {
                            terrain[x][z].btri = k;

                            terrain[x - hk][z].btri = 0;
                            terrain[x][z - hk].btri = 0;
                            terrain[x + 1 - hk][z + 1 - hk].utri = 0;

                            terrain[x][z].bint = terrain[x][z].bint | terrain[x - hk][z].bint | terrain[x][z - hk].bint;
                        }
                    }
                }
            }
        }

        const positions = [];
        const normals = [];
        const indices = [];
        let indicesCount = 0;
        const colors = [];
        for (let z = 0; z < size; z++) {
            for (let x = 0; x < size; x++) {

                // upper triangle
                if (terrain[x][z].utri !== 0) {
                    const tri = terrain[x][z].utri;
                    positions.push(...ptc(x, z));
                    positions.push(...ptc(x + tri, z));
                    positions.push(...ptc(x, z + tri));

                    for (let i = 0; i < 3; i++) normals.push(0, 1, 0);
                    for (let i = 0; i < 3; i++) indices.push(indicesCount + i);
                    indicesCount += 3;

                    let isHill = false;
                    if (terrain[x][z].h > 0) isHill = true;
                    if (terrain[x + tri][z].h > 0) isHill = true;
                    if (terrain[x][z + tri].h > 0) isHill = true;

                    const color = isHill ? hillColor : baseColor;
                    const tint = Math.random() * 0.1;
                    for (let i = 0; i < 3; i++) colors.push(color.r + tint, color.g + tint, color.b + tint, 1);
                }

                // below triangle
                if (terrain[x][z].btri !== 0) {
                    const tri = terrain[x][z].btri;
                    positions.push(...ptc(x + 1, z + 1 - tri));
                    positions.push(...ptc(x + 1, z + 1));
                    positions.push(...ptc(x + 1 - tri, z + 1));

                    for (let i = 0; i < 3; i++) normals.push(0, 1, 0);
                    for (let i = 0; i < 3; i++) indices.push(indicesCount + i);
                    indicesCount += 3;

                    let isHill = false;
                    if (terrain[x + 1][z + 1 - tri].h > 0) isHill = true;
                    if (terrain[x + 1 - tri][z + 1].h > 0) isHill = true;
                    if (terrain[x + 1][z + 1].h > 0) isHill = true;

                    const color = isHill ? hillColor : baseColor;
                    const tint = Math.random() * 0.1;
                    for (let i = 0; i < 3; i++) colors.push(color.r + tint, color.g + tint, color.b + tint, 1);
                }
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

        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 200, new BABYLON.Vector3(0, 0, 0));
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
