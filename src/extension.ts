import * as vscode from 'vscode';

function insertText(text: string) {
	const editor = vscode.window.activeTextEditor;

	if (!editor) {
		vscode.window.showErrorMessage(
			"Can't insert log because no document is open",
		);
		return;
	}

	const selection = editor.selection;

	const range = new vscode.Range(selection.start, selection.end);

	editor.edit((editBuilder) => {
		editBuilder.replace(range, text);
	});
}

export function activate(context: vscode.ExtensionContext) {
  let logMyText = vscode.commands.registerCommand('consoleHelper.getTime', async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) { return; }

    const { getText, getWordRangeAtPosition, lineAt } = editor.document;

    const selection = editor.selection;

    const wordRangeAtPosition = getWordRangeAtPosition(selection.active);

    let selectionText = getText(selection).trim();

    if (!selectionText && wordRangeAtPosition){
      selectionText = getText(wordRangeAtPosition).trim();
    }

    const config = vscode.workspace.getConfiguration("log-utils");

		const { icons } = config;

    const icon = icons[Math.floor(Math.random() * icons.length)];

    const clipboardText = await vscode.env.clipboard.readText();

    const { lineNumber } = lineAt(selection.active.line);

    insertText(`console.log('${icon}line:${lineNumber + 1}====${clipboardText}====', ${clipboardText})`);
	});

	context.subscriptions.push(logMyText);
}

export function deactivate() {}
