const util = require('util');

function drawBox(title, content) {
    const lines = content.split('\n');
    const width = Math.max(
        title.length + 4,
        ...lines.map(line => line.length + 2)
    );

    const top = `┌${'─'.repeat(width)}┐`;
    const titleLine = `│ ${title.padEnd(width - 2)} │`;
    const divider = `├${'─'.repeat(width)}┤`;
    const bottom = `└${'─'.repeat(width)}┘`;

    const body = lines
        .map(line => `│ ${line.padEnd(width - 2)} │`)
        .join('\n');

    return [
        top,
        titleLine,
        divider,
        body,
        bottom
    ].join('\n');
}

/**
 * Universal Box Debugger
 */
function debug(data, label = 'DEBUG') {
    try {
        const inspected = util.inspect(data, {
            depth: 5,
            colors: true,
            breakLength: 80,
            compact: false
        });

        const box = drawBox(label, inspected);
        console.log(box);
    } catch (err) {
        const box = drawBox(
            `${label} ERROR`,
            err.message
        );
        console.log(box);
    }
}
global.debug = debug;

module.exports = debug;

