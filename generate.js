const fs = require('fs');

function generateTerrain(size) {
    const t = [];
    for (let i = 0; i < size; i++) {
        t[i] = [];
        for (let j = 0; j < size; j++) {
            t[i][j] = {
                h: 0,
                int: 0
            }
        }
    }

    function raiseHill(x, z, h) {
        const queue = [];
        const first = { x, z, h };

        t[first.x][first.z].h = first.h;
        // t[first.x][first.z].int = 1;
        queue.push(first);

        while (queue.length > 0) {
            const next = queue.shift();

            if (next.h > 0) {
                const adj = adjacentPoints(next.x, next.z);
                for (let i = 0; i < adj.length; i++) {
                    if (t[adj[i].x] && t[adj[i].x][adj[i].z] && t[adj[i].x][adj[i].z].h === 0) {
                        const hill = Math.random() < 0.75 ? next.h - 1 : next.h;
                        t[adj[i].x][adj[i].z].h = hill;
                        t[adj[i].x][adj[i].z].int = hill % 6 === 0 ? 1 : 0;
                        queue.push({ ...adj[i], h: hill });
                    }
                }
            }
        }
    }

    function digLake(x, z, h) {
        const queue = [];
        const first = { x, z, h };

        t[first.x][first.z].h = first.h;
        // t[first.x][first.z].int = 1;
        queue.push(first);

        while (queue.length > 0) {
            const next = queue.shift();

            if (next.h < 0) {
                const adj = adjacentPoints(next.x, next.z);
                for (let i = 0; i < adj.length; i++) {
                    if (t[adj[i].x] && t[adj[i].x][adj[i].z] && t[adj[i].x][adj[i].z].h === 0 && t[adj[i].x][adj[i].z].int === 0) {
                        const hill = Math.random() < 0.6 ? next.h + 1 : next.h;
                        t[adj[i].x][adj[i].z].h = hill;
                        t[adj[i].x][adj[i].z].int = hill === 0 ? 1 : 0;
                        queue.push({ ...adj[i], h: hill });
                    }
                }
            }
        }
    }

    // raiseHill(Math.random() * size | 0, Math.random() * size | 0, 50);
    // raiseHill(Math.random() * size | 0, Math.random() * size | 0, 30);
    // raiseHill(Math.random() * size | 0, Math.random() * size | 0, 30);
    // raiseHill(Math.random() * size | 0, Math.random() * size | 0, 20);
    // raiseHill(Math.random() * size | 0, Math.random() * size | 0, 20);
    // raiseHill(Math.random() * size | 0, Math.random() * size | 0, 20);
    // raiseHill(Math.random() * size | 0, Math.random() * size | 0, 10);
    // raiseHill(Math.random() * size | 0, Math.random() * size | 0, 10);
    // raiseHill(Math.random() * size | 0, Math.random() * size | 0, 10);
    raiseHill(Math.random() * size / 2 | 0 + size / 4, Math.random() * size / 2 | 0 + size / 4, 4);
    let x, z;
    do {
        x = Math.random() * size / 2 | 0 + size / 4;
        z = Math.random() * size / 2 | 0 + size / 4;
    }
    while (t[x][z].h !== 0 || t[x][z].int === 1);
    digLake(x, z, -2);
    // raiseHill(31, 31, 12);

    return t;
}

function adjacentPoints(x, z) {
    return [
        { x: x - 1, z: z },
        { x: x - 1, z: z + 1 },
        { x: x, z: z + 1 },
        { x: x + 1, z: z },
        { x: x + 1, z: z - 1 },
        { x: x, z: z - 1 }
    ];
}

const terrain = generateTerrain(65);
fs.writeFileSync('terrain.js', 'const terrain = ' + JSON.stringify(terrain) + ';', 'utf8');
