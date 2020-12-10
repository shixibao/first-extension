// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const insertText = (val:any) => {
    const editor = vscode.window.activeTextEditor;
    const selection = editor?.selection;
    // 获取光标当前行
    const lineOfSelectedVar = selection?.active.line;
	// edit方法获取editBuilder实例，在后一行添加
	editor?.edit((editBuilder) => {
		if (lineOfSelectedVar) {
			editBuilder.insert(new vscode.Position(lineOfSelectedVar + 1, 0),val)
		}
	});
}

function getAllLogStatements() {
	const editor = vscode.window.activeTextEditor;
	const document = editor?.document;
	const documentText = document?.getText();

	let logStatements = [];
	const logRegex = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
	let match;
	while (match = logRegex.exec(documentText)) {
		let matchRange = new vscode.Range(document?.positionAt(match.index), document?.positionAt(match.index + match[0].length))
		if (!matchRange.isEmpty) {
			logStatements.push(matchRange)
		}
	}
	return logStatements;
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "firstextension" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('myExt.helloZhuFeng', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('你好，石喜宝!');
	});

	let insertLog = vscode.commands.registerCommand('firstExt.insertLog', () => {
		const editor = vscode.window.activeTextEditor;
		const selection = editor?.selection;
		const text = editor?.document.getText(selection);
		const logToInsert = `console.log('${text}:', ${text});\n`;
		text ? insertText(logToInsert) : insertText('console.log();');
	})

	const deleteAllLog = vscode.commands.registerCommand('firstExt.deleteAllLog', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) { return; }
		let workspaceEdit = new vscode.WorkspaceEdit();
		const document = editor.document;
		const logStatements = getAllLogStatements();

		logStatements.forEach(log => {
			workspaceEdit.delete(document.uri, log);
			// vscode.commands.executeCommand('editor.action.deleteLines')
		})

		vscode.workspace.applyEdit(workspaceEdit).then(() => {
			vscode.window.showInformationMessage(`${logStatements.length} console.log deleted`)
		})
	})

	const removeComments = vscode.commands.registerCommand('firstExt.removeComments', () => {
		const editor = vscode.window.activeTextEditor;
		editor?.edit(editBuilder => {
			let text = editor.document.getText();
			// 正则匹配替换掉注释文本
			text = text.replace(/((\/\*([\w\W]+?)\*\/)|(\/\/(.(?!"\)))+)|(^\s*(?=\r?$)\n))/gm, '').replace(/(^\s*(?=\r?$)\n)/gm, '').replace(/\\n\\n\?/gm, '');
			const end = new vscode.Position(editor.document.lineCount + 1, 0)
			editBuilder.replace(new vscode.Range(new vscode.Position(0, 0), end), text);
			vscode.commands.executeCommand('editor.action.formatDocument')
		})
	})

	context.subscriptions.push(disposable, insertLog, deleteAllLog, removeComments);
}

// this method is called when your extension is deactivated
export function deactivate() {}
