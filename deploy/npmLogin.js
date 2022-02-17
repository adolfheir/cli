var shell = require('shelljs');

function npmlogin() {
    var userName = process.env.NPM_USER;
    var password = process.env.NPM_PASSWORD;
    var email = process.env.NPM_EMAIL;
    var register = process.env.NPM_REGISTER
    // var userName = "cyh";
    // var password = "";
    // var email = "1428899467@qq.com";
    // var register = "http://10.0.0.200:4873/"
    var inputArray = [
        userName + "\n",
        password + "\n",
        email + "\n",
    ]

    var child = shell.exec(`npm login --registry ${register}`, { async: true })

    child.stdout.on('data', (chunk) => {
        // shell.echo(byteToString(chunk));
        var cmd = inputArray.shift();
        if (cmd) {
            shell.echo("input " + cmd);
            child.stdin.write(cmd);
        } else {
            child.stdin.end();
        }
    })
}
npmlogin();

