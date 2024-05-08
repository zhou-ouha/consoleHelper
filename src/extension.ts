import * as vscode from 'vscode';

function deleteFoundLogStatements(
	workspaceEdit: vscode.WorkspaceEdit,
	docUri: vscode.Uri,
	logs: vscode.Range[],
	logType: string,
) {
	logs.forEach((log) => {
		workspaceEdit.delete(docUri, log);
	});

	vscode.workspace
		.applyEdit(workspaceEdit)
		.then(() =>
			vscode.window.showInformationMessage(
				`${logs.length} console.${logType} deleted`,
			),
		);
}

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

function getAllLogStatements(
	document: vscode.TextDocument,
	documentText: string,
	logType: string,
) {
	const logStatements = [];

	let match;
	let logRegex = /console.log\((.*)\);?/g;
	if (logType === "warn") {
		logRegex = /console.warn\((.*)\);?/g;
	} else if (logType === "error") {
		logRegex = /console.error\((.*)\);?/g;
	} else if (logType === "debug") {
		logRegex = /console.debug\((.*)\);?/g;
	} else if (logType === "table") {
		logRegex = /console.table\((.*)\);?/g;
	} else if (logType === "info") {
		logRegex = /console.info\((.*)\);?/g;
	}
	while ((match = logRegex.exec(documentText))) {
		const matchRange = new vscode.Range(
			document.positionAt(match.index),
			document.positionAt(match.index + match[0].length),
		);
		if (!matchRange.isEmpty) {
      logStatements.push(matchRange);
    }
	}
	return logStatements;
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

  const deleteAllLogStatements = vscode.commands.registerCommand(
		"consoleHelper.deleteAllLogStatements",
		() => {
			const editor = vscode.window.activeTextEditor;

			if (!editor) {
        return;
      }

			const document = editor.document;

			const documentText = editor.document.getText();

			const workspaceEdit = new vscode.WorkspaceEdit();

			const config = vscode.workspace.getConfiguration("log-utils");

			const { logType } = config;

			const logStatements = getAllLogStatements(
				document,
				documentText,
				logType,
			);

			deleteFoundLogStatements(
				workspaceEdit,
				document.uri,
				logStatements,
				logType,
			);
		},
	);

	context.subscriptions.push(logMyText);

  context.subscriptions.push(deleteAllLogStatements);
}

export function deactivate() {}
