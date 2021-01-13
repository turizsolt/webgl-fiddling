window.addEventListener('DOMContentLoaded', () => {
    let framesElapsed = 0;

    const createGround = function (scene) {
        const size = 64;
        const halfsize = size / 2;

        const ground = new BABYLON.Mesh('ground', scene);

        var skybox = BABYLON.Mesh.CreateBox("skyBox", 4000.0, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./textures/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;

        var water = new BABYLON.Mesh('water', scene);

        const baseColor = new BABYLON.Color3(0, 0.6, 0);
        const hillColor = new BABYLON.Color3(0.63, 0.46, 0.18);
        const lakeColor = new BABYLON.Color3(0.83, 0.76, 0.58);
        const waterColor = new BABYLON.Color3(0.13, 0.46, 0.88);

        const sqrt3 = Math.sqrt(3);
        const unit = 10;
        const halfunit = 5;
        const zunit = unit * sqrt3 / 2;

        const ptc = function (x, z) {
            px = -(unit * halfsize) - (zunit * halfsize / 2) + (x * unit) + (z * halfunit);
            pz = -(zunit * halfsize) + (z * zunit);
            h = terrain[x][z].h * unit;

            return [px, h, pz];
        }

        const ptc0 = function (x, z) {
            px = -(unit * halfsize) - (zunit * halfsize / 2) + (x * unit) + (z * halfunit);
            pz = -(zunit * halfsize) + (z * zunit);

            return [px, 0, pz];
        }

        const smoothEdges = function (fx, fz, tx, tz, d, mx, mz) {
            const fh = terrain[fx][fz].h;
            const th = terrain[tx][tz].h;
            for (let i = 1; i < d; i++) {
                terrain[fx + i * mx][fz + i * mz].h = (fh + (th - fh) * (i / d));// * (show ? 10 : 1);
            }
        }

        for (let x = 0; x < size; x++) {
            for (let z = 0; z < size; z++) {
                terrain[x][z].utri = 1;
                terrain[x][z].btri = 1;

                terrain[x][z].uint = terrain[x][z].int | terrain[x + 1][z].int | terrain[x][z + 1].int;
                terrain[x][z].bint = terrain[x + 1][z + 1].int | terrain[x + 1][z].int | terrain[x][z + 1].int;
            }
        }

        for (let k = 2; k < 1025; k *= 2) {
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

        for (let k = 1024; k > 1; k /= 2) {
            let hk = k / 2;

            for (let x = 0; x < size; x += k) {
                for (let z = 0; z < size; z += k) {
                    if (terrain[x][z].utri === k) {
                        smoothEdges(x, z, x, z + k, k, 0, 1);
                        smoothEdges(x, z, x + k, z, k, 1, 0);
                        smoothEdges(x + k, z, x, z + k, k, -1, 1);
                    }
                }
            }

            for (let x = k - 1; x < size; x += k) {
                for (let z = k - 1; z < size; z += k) {
                    if (terrain[x][z].btri === k) {
                        smoothEdges(x + 1 - k, z + 1, x + 1, z + 1, k, 1, 0);
                        smoothEdges(x + 1, z + 1 - k, x + 1, z + 1, k, 0, 1);
                        smoothEdges(x + 1 - k, z + 1, x + 1, z + 1 - k, k, 1, -1);

                    }
                }
            }
        }

        const positions = [];
        const normals = [];
        const indices = [];
        let indicesCount = 0;

        const water_positions = [];
        const water_normals = [];
        const water_indices = [];
        let water_indicesCount = 0;
        const water_colors = [];

        const colors = [];
        for (let z = 0; z < size; z++) {
            for (let x = 0; x < size; x++) {

                // upper triangle
                if (terrain[x][z].utri !== 0) {
                    const tri = terrain[x][z].utri;
                    positions.push(...ptc(x, z));
                    positions.push(...ptc(x + tri, z));
                    positions.push(...ptc(x, z + tri));

                    const pos = [];
                    pos.push(new BABYLON.Vector3(...ptc(x, z)));
                    pos.push(new BABYLON.Vector3(...ptc(x + tri, z)));
                    pos.push(new BABYLON.Vector3(...ptc(x, z + tri)));
                    const normal = BABYLON.Vector3.Normalize(BABYLON.Vector3.Cross(pos[0].subtract(pos[1]), pos[2].subtract(pos[1])));

                    for (let i = 0; i < 3; i++) normals.push(normal.x, normal.y, normal.z);
                    for (let i = 0; i < 3; i++) indices.push(indicesCount + i);
                    indicesCount += 3;

                    let isHill = false;
                    if (terrain[x][z].h > 0) isHill = true;
                    if (terrain[x + tri][z].h > 0) isHill = true;
                    if (terrain[x][z + tri].h > 0) isHill = true;

                    let isLake = false;
                    if (terrain[x][z].h < 0) isLake = true;
                    if (terrain[x + tri][z].h < 0) isLake = true;
                    if (terrain[x][z + tri].h < 0) isLake = true;

                    if (isLake) {
                        water_positions.push(...ptc0(x, z));
                        water_positions.push(...ptc0(x + tri, z));
                        water_positions.push(...ptc0(x, z + tri));
                        for (let i = 0; i < 3; i++) water_normals.push(0, 1, 0);
                        for (let i = 0; i < 3; i++) water_indices.push(water_indicesCount + i);
                        water_indicesCount += 3;

                        const color = waterColor;
                        const tint = Math.random() * 0.1;
                        for (let i = 0; i < 3; i++) water_colors.push(color.r + tint, color.g + tint, color.b + tint, 1);
                    }

                    const color = isHill ? hillColor : isLake ? lakeColor : baseColor;
                    const tint = Math.random() * 0.1;
                    for (let i = 0; i < 3; i++) colors.push(color.r + tint, color.g + tint, color.b + tint, 1);
                }

                // below triangle
                if (terrain[x][z].btri !== 0) {
                    const tri = terrain[x][z].btri;
                    positions.push(...ptc(x + 1, z + 1 - tri));
                    positions.push(...ptc(x + 1, z + 1));
                    positions.push(...ptc(x + 1 - tri, z + 1));

                    const pos = [];
                    pos.push(new BABYLON.Vector3(...ptc(x + 1, z + 1 - tri)));
                    pos.push(new BABYLON.Vector3(...ptc(x + 1, z + 1)));
                    pos.push(new BABYLON.Vector3(...ptc(x + 1 - tri, z + 1)));
                    const normal = BABYLON.Vector3.Normalize(BABYLON.Vector3.Cross(pos[0].subtract(pos[1]), pos[2].subtract(pos[1])));
                    for (let i = 0; i < 3; i++) normals.push(normal.x, normal.y, normal.z);

                    for (let i = 0; i < 3; i++) indices.push(indicesCount + i);
                    indicesCount += 3;

                    let isHill = false;
                    if (terrain[x + 1][z + 1 - tri].h > 0) isHill = true;
                    if (terrain[x + 1 - tri][z + 1].h > 0) isHill = true;
                    if (terrain[x + 1][z + 1].h > 0) isHill = true;

                    let isLake = false;
                    if (terrain[x + 1][z + 1 - tri].h < 0) isLake = true;
                    if (terrain[x + 1 - tri][z + 1].h < 0) isLake = true;
                    if (terrain[x + 1][z + 1].h < 0) isLake = true;

                    if (isLake) {
                        water_positions.push(...ptc0(x + 1, z + 1 - tri));
                        water_positions.push(...ptc0(x + 1, z + 1));
                        water_positions.push(...ptc0(x + 1 - tri, z + 1));

                        for (let i = 0; i < 3; i++) water_normals.push(0, 1, 0);
                        for (let i = 0; i < 3; i++) water_indices.push(water_indicesCount + i);
                        water_indicesCount += 3;

                        const color = waterColor;
                        const tint = Math.random() * 0.1;
                        for (let i = 0; i < 3; i++) water_colors.push(color.r + tint, color.g + tint, color.b + tint, 1);
                    }

                    const color = isHill ? hillColor : isLake ? lakeColor : baseColor;
                    const tint = Math.random() * 0.1;
                    for (let i = 0; i < 3; i++) colors.push(color.r + tint, color.g + tint, color.b + tint, 1);
                }
            }
        }

        ground.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true);
        ground.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals, true);
        ground.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors, true);
        ground.setIndices(indices);

        water.setVerticesData(BABYLON.VertexBuffer.PositionKind, water_positions, true);
        water.setVerticesData(BABYLON.VertexBuffer.NormalKind, water_normals, true);
        water.setVerticesData(BABYLON.VertexBuffer.ColorKind, water_colors, true);
        water.setIndices(water_indices);

        const groundMaterial = new BABYLON.StandardMaterial("material", scene);
        groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        ground.material = groundMaterial;
        // groundMaterial.wireframe = true;

        const w2Material = new BABYLON.StandardMaterial("material", scene);
        w2Material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        // water.material = w2Material;

        var waterMaterial = new BABYLON.WaterMaterial("waterMaterial", scene, new BABYLON.Vector2(128, 128));
        waterMaterial.backFaceCulling = true;
        waterMaterial.bumpTexture = new BABYLON.Texture("./textures/waterbump.png", scene);
        waterMaterial.windForce = -10;
        waterMaterial.bumpHeight = 0.1;
        waterMaterial.windDirection = new BABYLON.Vector2(1, 1);
        waterMaterial.waterColor = new BABYLON.Color3(0, 100 / 255, 221 / 255);
        waterMaterial.waveHeight = 0;
        waterMaterial.waveLength = 0;
        waterMaterial.colorBlendFactor = 0.5;
        waterMaterial.addToRenderList(skybox);
        waterMaterial.addToRenderList(ground);
        water.material = waterMaterial;

        return ground;
    }

    const canvas = document.getElementById('render-canvas');
    const fpsLabel = document.getElementById("fps-label");
    const renderEngine = new BABYLON.Engine(canvas, true);
    const createScene = () => {
        const scene = new BABYLON.Scene(renderEngine);

        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 500 /*10000*/, new BABYLON.Vector3(0, 0, 0));
        camera.attachControl(canvas, true);
        camera.maxZ = 50000;
        camera.maxX = 50000;
        camera.maxY = 50000;
        camera.wheelPrecision = 0.3; //0.05;
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
