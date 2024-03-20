"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("./fs"));
function activate(context) {
    let disposable = vscode.commands.registerCommand("uwap.pluginfilepacker.generate", generate);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
async function generate() {
    var textExtensions = vscode.workspace.getConfiguration().get("UWAP.pluginFilePacker.textExtensions").split(/[\s,;]+/);
    var folders = vscode.workspace.workspaceFolders;
    if (folders === undefined || folders.length !== 1) {
        vscode.window.showErrorMessage("No .csproj file found!");
        return;
    }
    var projUri = folders[0].uri;
    var projectFiles = (await fs.getFileNames(projUri)).filter(file => file.endsWith(".csproj"));
    var projName;
    switch (projectFiles.length) {
        case 0:
            vscode.window.showErrorMessage("No .csproj file found!");
            return;
        case 1:
            var result = projectFiles[0];
            projName = result.substring(0, result.length - 7);
            break;
        default:
            vscode.window.showErrorMessage("Multiple .csproj files found, please open one project specifically!");
            return;
    }
    if (!fs.exists(vscode.Uri.joinPath(projUri, "Files"))) {
        vscode.window.showErrorMessage("No directory 'Files' was found!");
        return;
    }
    var namespace = await getNamespaceFromFile(vscode.Uri.joinPath(projUri, "FileHandler.cs")) ?? await getNamespaceFromFile(vscode.Uri.joinPath(projUri, "FileHandlerCustom.cs")) ?? "uwap.WebFramework.Plugins";
    var className = await getClassFromFile(vscode.Uri.joinPath(projUri, "FileHandler.cs")) ?? await getClassFromFile(vscode.Uri.joinPath(projUri, "FileHandlerCustom.cs")) ?? projName;
    var files = await fs.getFilesRecursive(vscode.Uri.joinPath(projUri, "Files"));
    var pathIndex = projUri.path.length + 6;
    //start
    var handlerLines = [
        `namespace ${namespace};`,
        "",
        `public partial class ${className} : ${namespace !== "uwap.WebFramework.Plugins" ? "uwap.WebFramework.Plugins." : ""}Plugin`,
        "{",
        "\tpublic override byte[]? GetFile(string relPath, string pathPrefix, string domain)",
        "\t\t=> relPath switch",
        "\t\t{"
    ];
    var resxLines = [
        "<?xml version=\"1.0\" encoding=\"utf-8\"?>",
        "<root>",
        "\t<xsd:schema id=\"root\" xmlns=\"\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:msdata=\"urn:schemas-microsoft-com:xml-msdata\">",
        "\t\t<xsd:import namespace=\"http://www.w3.org/XML/1998/namespace\" />",
        "\t\t<xsd:element name=\"root\" msdata:IsDataSet=\"true\">",
        "\t\t\t<xsd:complexType>",
        "\t\t\t\t<xsd:choice maxOccurs=\"unbounded\">",
        "\t\t\t\t\t<xsd:element name=\"metadata\">",
        "\t\t\t\t\t\t<xsd:complexType>",
        "\t\t\t\t\t\t\t<xsd:sequence>",
        "\t\t\t\t\t\t\t\t<xsd:element name=\"value\" type=\"xsd:string\" minOccurs=\"0\" />",
        "\t\t\t\t\t\t\t</xsd:sequence>",
        "\t\t\t\t\t\t\t<xsd:attribute name=\"name\" use=\"required\" type=\"xsd:string\" />",
        "\t\t\t\t\t\t\t<xsd:attribute name=\"type\" type=\"xsd:string\" />",
        "\t\t\t\t\t\t\t<xsd:attribute name=\"mimetype\" type=\"xsd:string\" />",
        "\t\t\t\t\t\t\t<xsd:attribute ref=\"xml:space\" />",
        "\t\t\t\t\t\t</xsd:complexType>",
        "\t\t\t\t\t</xsd:element>",
        "\t\t\t\t\t<xsd:element name=\"assembly\">",
        "\t\t\t\t\t\t<xsd:complexType>",
        "\t\t\t\t\t\t\t<xsd:attribute name=\"alias\" type=\"xsd:string\" />",
        "\t\t\t\t\t\t\t<xsd:attribute name=\"name\" type=\"xsd:string\" />",
        "\t\t\t\t\t\t</xsd:complexType>",
        "\t\t\t\t\t</xsd:element>",
        "\t\t\t\t\t<xsd:element name=\"data\">",
        "\t\t\t\t\t\t<xsd:complexType>",
        "\t\t\t\t\t\t\t<xsd:sequence>",
        "\t\t\t\t\t\t\t\t<xsd:element name=\"value\" type=\"xsd:string\" minOccurs=\"0\" msdata:Ordinal=\"1\" />",
        "\t\t\t\t\t\t\t\t<xsd:element name=\"comment\" type=\"xsd:string\" minOccurs=\"0\" msdata:Ordinal=\"2\" />",
        "\t\t\t\t\t\t\t</xsd:sequence>",
        "\t\t\t\t\t\t\t<xsd:attribute name=\"name\" type=\"xsd:string\" use=\"required\" msdata:Ordinal=\"1\" />",
        "\t\t\t\t\t\t\t<xsd:attribute name=\"type\" type=\"xsd:string\" msdata:Ordinal=\"3\" />",
        "\t\t\t\t\t\t\t<xsd:attribute name=\"mimetype\" type=\"xsd:string\" msdata:Ordinal=\"4\" />",
        "\t\t\t\t\t\t\t<xsd:attribute ref=\"xml:space\" />",
        "\t\t\t\t\t\t</xsd:complexType>",
        "\t\t\t\t\t</xsd:element>",
        "\t\t\t\t\t<xsd:element name=\"resheader\">",
        "\t\t\t\t\t\t<xsd:complexType>",
        "\t\t\t\t\t\t\t<xsd:sequence>",
        "\t\t\t\t\t\t\t\t<xsd:element name=\"value\" type=\"xsd:string\" minOccurs=\"0\" msdata:Ordinal=\"1\" />",
        "\t\t\t\t\t\t\t</xsd:sequence>",
        "\t\t\t\t\t\t\t<xsd:attribute name=\"name\" type=\"xsd:string\" use=\"required\" />",
        "\t\t\t\t\t\t</xsd:complexType>",
        "\t\t\t\t\t</xsd:element>",
        "\t\t\t\t</xsd:choice>",
        "\t\t\t</xsd:complexType>",
        "\t\t</xsd:element>",
        "\t</xsd:schema>",
        "\t<resheader name=\"resmimetype\">",
        "\t\t<value>text/microsoft-resx</value>",
        "\t</resheader>",
        "\t<resheader name=\"version\">",
        "\t\t<value>2.0</value>",
        "\t</resheader>",
        "\t<resheader name=\"reader\">",
        "\t\t<value>System.Resources.ResXResourceReader, System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089</value>",
        "\t</resheader>",
        "\t<resheader name=\"writer\">",
        "\t\t<value>System.Resources.ResXResourceWriter, System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089</value>",
        "\t</resheader>",
        "\t<assembly alias=\"mscorlib\" name=\"mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089\" />"
    ];
    //file contents
    var resxIndex = 0;
    var wfNamespacePrefix = (namespace === "uwap.WebFramework" || namespace.startsWith("uwap.WebFramework.")) ? "" : "uwap.WebFramework.";
    var customExists = await fs.exists(vscode.Uri.joinPath(projUri, "FileHandlerCustom.cs"));
    for (var file of files) {
        var relPath = file.path.substring(pathIndex);
        var bytes = await fs.readBytes(file);
        if (textExtensions.some(x => relPath.endsWith(x))) {
            var text = new TextDecoder().decode(bytes);
            if (text.includes("[PATH_PREFIX]") || text.includes("[PATH_HOME]") || text.includes("[DOMAIN]")) {
                //text file with replacements
                handlerLines.push(`\t\t\t"${relPath}" => System.Text.Encoding.UTF8.GetBytes($"${text
                    .replaceAll("\\", "\\\\")
                    .replaceAll("\"", "\\\"")
                    .replaceAll("\0", "\\0")
                    .replaceAll("\f", "\\f")
                    .replaceAll("\n", "\\n")
                    .replaceAll("\r", "\\r")
                    .replaceAll("\t", "\\t")
                    .replaceAll("\v", "\\v")
                    .replaceAll("{", "{{")
                    .replaceAll("}", "}}")
                    .replaceAll("[PATH_PREFIX]", "{pathPrefix}")
                    .replaceAll("[PATH_HOME]", "{(pathPrefix == \"\" ? \"/\" : pathPrefix)}")
                    .replaceAll("[DOMAIN]", "{domain}")
                    .replaceAll("[DOMAIN_MAIN]", `{${wfNamespacePrefix}Parsers.DomainMain(domain)}`)}"),`);
                continue;
            }
        }
        //raw file (add to resx)
        handlerLines.push(`\t\t\t"${relPath}" => (byte[]?)PluginFiles_ResourceManager.GetObject(\"File${resxIndex}\"),`);
        resxLines = resxLines.concat([
            `\t<data name=\"File${resxIndex}\" type=\"System.Byte[], mscorlib\">`,
            "\t\t<value>",
            `\t\t\t${Buffer.from(bytes).toString("base64")}`,
            "\t\t</value>",
            "\t</data>"
        ]);
        resxIndex++;
    }
    //file versions
    handlerLines = handlerLines.concat([
        customExists ? "\t\t\t_ => GetFileCustom(relPath, pathPrefix, domain)" : "\t\t\t_ => null",
        "\t\t};",
        "\t",
        "\tpublic override string? GetFileVersion(string relPath)",
        "\t\t=> relPath switch",
        "\t\t{",
    ]);
    for (var file of files) {
        handlerLines.push(`\t\t\t"${file.path.substring(pathIndex)}" => "${(await fs.modifiedTimestamp(file)).toString()}",`);
    }
    //end
    handlerLines = handlerLines.concat([
        customExists ? "\t\t\t_ => GetFileVersionCustom(relPath)" : "\t\t\t_ => null",
        "\t\t};"
    ]);
    if (resxIndex !== 0) {
        handlerLines = handlerLines.concat([
            "\t",
            `\tprivate static readonly System.Resources.ResourceManager PluginFiles_ResourceManager = new("${projName}.Properties.PluginFiles", typeof(${className}).Assembly);`
        ]);
    }
    handlerLines.push("}");
    resxLines.push("</root>");
    //write
    fs.writeLines(vscode.Uri.joinPath(projUri, "FileHandler.cs"), handlerLines);
    if (resxIndex !== 0) {
        var prop = vscode.Uri.joinPath(projUri, "Properties");
        if (!(await fs.exists(prop))) {
            await fs.createDirectory(prop);
        }
        fs.writeLines(vscode.Uri.joinPath(prop, "PluginFiles.resx"), resxLines);
    }
    //done
    vscode.window.showInformationMessage(`Generated FileHandler.cs for ${projName}!`);
}
async function getNamespaceFromFile(path) {
    if (!(await fs.exists(path))) {
        return undefined;
    }
    for (var line of await fs.readLines(path)) {
        if (line.startsWith("namespace ")) {
            return line.substring(10).split(/ |{|;/)[0];
        }
    }
    return undefined;
}
async function getClassFromFile(path) {
    if (!(await fs.exists(path))) {
        return undefined;
    }
    for (var line of await fs.readLines(path)) {
        var index = line.indexOf("class ");
        if (index !== -1 && (index === 0 || (line[index - 1] === " " && line[index - 1] === "\t"))) {
            return line.substring(index + 6).split(/ |\t|:|{/)[0];
        }
    }
    return undefined;
}
//# sourceMappingURL=extension.js.map