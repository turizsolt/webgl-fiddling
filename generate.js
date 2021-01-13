const fs = require('fs');

function generateTerrain(size) {
    const t = [];
    for (let i = 0; i < size; i++) {
        t[i] = [];
        for (let j = 0; j < size; j++) {
            t[i][j] = {
                h: 0
            }
        }
    }

    function raiseHill(x, z, h) {
        const queue = [];
        const first = { x, z, h };

        t[first.x][first.z].h = first.h;
        queue.push(first);

        while (queue.length > 0) {
            const next = queue.shift();

            if (next.h > 1) {
                const adj = adjacentPoints(next.x, next.z);
                for (let i = 0; i < adj.length; i++) {
                    if (t[adj[i].x] && t[adj[i].x][adj[i].z] && t[adj[i].x][adj[i].z].h === 0) {

                        t[adj[i].x][adj[i].z].h = next.h - 1;
                        queue.push({ ...adj[i], h: next.h - 1 });
                    }
                }
            }
        }
    }

    raiseHill(Math.random() * size | 0, Math.random() * size | 0, 10);
    raiseHill(Math.random() * size | 0, Math.random() * size | 0, 8);
    raiseHill(Math.random() * size | 0, Math.random() * size | 0, 8);
    raiseHill(Math.random() * size | 0, Math.random() * size | 0, 6);
    raiseHill(Math.random() * size | 0, Math.random() * size | 0, 6);
    raiseHill(Math.random() * size | 0, Math.random() * size | 0, 6);
    raiseHill(Math.random() * size | 0, Math.random() * size | 0, 4);
    raiseHill(Math.random() * size | 0, Math.random() * size | 0, 4);
    raiseHill(Math.random() * size | 0, Math.random() * size | 0, 4);
    raiseHill(Math.random() * size | 0, Math.random() * size | 0, 4);

    return t;
}

function adjacentPoints(x, z) {
    if (z % 2 === 0) {
        return [
            { x: x - 1, z: z },
            { x: x - 1, z: z + 1 },
            { x: x, z: z + 1 },
            { x: x + 1, z: z },
            { x: x, z: z - 1 },
            { x: x - 1, z: z - 1 }
        ];
    } else {
        return [
            { x: x - 1, z: z },
            { x: x, z: z + 1 },
            { x: x + 1, z: z + 1 },
            { x: x + 1, z: z },
            { x: x + 1, z: z - 1 },
            { x: x, z: z - 1 }
        ];
    }
}

const terrain = generateTerrain(1024);
fs.writeFileSync('terrain.js', 'const terrain = ' + JSON.stringify(terrain) + ';', 'utf8');
