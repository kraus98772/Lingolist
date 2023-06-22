const { app, BrowserWindow, ipcMain, dialog} = require("electron");
const Reverso = require("reverso-api")
const path = require('path')
var os = require("os");
const fs = require("fs");
const readline = require('readline');

const createWindow = () => {
    const win = new BrowserWindow(
        {
            width: 1920,
            height: 1080,
            minWidth: 1000,
            minHeight: 1000,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });


    // Read config file
    let data

    let configPath = app.getPath('userData') + "/config.json";
    let res = fs.existsSync(configPath);
    console.log(res);
    if (res) {
        let configPath = app.getPath('userData') + "/config.json";
        let dt = fs.readFileSync(configPath);
        data = JSON.parse(dt);
        console.log(data);
    }

    win.loadFile("index.html")
    .then(() => {win.webContents.send('sendConfig', data.theme);})
    .then(() => win.show());

    return win;
}

ipcMain.on("saveData", (sender, data) => {
    console.log(data);
    let sData = JSON.stringify(data);
    let configPath = app.getPath('userData') + "/config.json";
    fs.writeFileSync(configPath, sData);
    console.log("Data Saved");
});


ipcMain.on("generateFile", async (sender, data) => {
    

    /*let selectedOptions = [
        {name: "input-file", value: ""},
        {name: "output-folder", value: ""},
        {name: "output-type", value: ""},
        {name: "output-format", value: "", delimeter: ""},
        {name: "input-language", value: ""},
        {name: "output-language", value: ""},
    ]*/

    /*
    <p class="option" value="word-with-trans">Original Word With Translation</p>
        <p class="option" value="word-with-example">Original Word With Example Sentence</p>
        <p class="option" value="only-trans">Only Translation</p>
        <p class="option" value="only-example">Only Example</p>
        <p class="option" value="example-with-word-trans">Example Sentence With Word Translation</p>
    */
    const inputFilePath = data[0].value;
    const outputFolder = data[1].value;
    const outputType = data[2].value;
    const delimeter = data[3].delimeter;
    const extension = data[3].value;
    const inputLanguage = data[4].value;
    const outputLanguage = data[5].value;
    const highlightColor = data[6].value;
    const isHighlighted = data[6].isChecked;

    if(outputType == "word-with-trans")
    {
        try{
            getOriginalWordWithTranslation(inputFilePath, outputFolder, extension, delimeter, inputLanguage, outputLanguage, highlightColor, isHighlighted)
        }
        catch (error){
            console.error(error);
        }
    }
    else if(outputType == "word-with-example")
    {
        try{
            getOriginalWordWithExampleSentence(inputFilePath, outputFolder, extension, delimeter, inputLanguage, outputLanguage, highlightColor, isHighlighted)
        }
        catch (error){
            console.error(error);
        }
    }
    else if(outputType == "only-trans"){ 
        try{
            getOnlyTranslation(inputFilePath, outputFolder, extension, delimeter, inputLanguage, outputLanguage, highlightColor, isHighlighted)
        }
        catch (error){
            console.error(error);
        }
    }else if(outputType == "only-example")
    {
        try{
            getOnlyExample(inputFilePath, outputFolder, extension, inputLanguage, outputLanguage, highlightColor, isHighlighted)
        }
        catch (error){
            console.error(error);
        }
    }else if(outputType == "example-with-word-trans")
    {
        try{
            getExampleSentenceWithWordTranslation(inputFilePath, outputFolder, extension, delimeter, inputLanguage, outputLanguage, highlightColor, isHighlighted)
        }
        catch (error){
            console.error(error);
        }
    }



    //const fileStream = fs.createReadStream(inputFilePath);
  //
    //const rl = readline.createInterface({
    //  input: fileStream,
    //  crlfDelay: Infinity
    //});
//
    //
    //try
    //{
    //    const reverso = new Reverso();
    //    for await (const line of rl) {
    //        reverso.getContext(
    //            line,
    //            data[4].value,
    //            data[5].value,
    //            (err, response) => {
    //                if (err) throw new Error(err.message)
    //                
    //                let example = response.examples[0].source.replace(line, "<b style='background-color:" + highlightColor + "'>" + line + "</b>");
    //                let exampleTranslation = response.examples[0].target;
    //                fs.appendFileSync(data[1].value +'/result.' + data[3].value, example + delimeter + exampleTranslation + os.EOL);
//
    //            }
    //        )
    //        
    //    }
    //}
    //catch (error){
    //    console.error(error);
    //}

})

async function getOriginalWordWithTranslation(inputFilePath, outputFolder, extension, delimeter, inputLanguage, outputLanguage, highlightColor, isHighlighted)
{

    const fileStream = fs.createReadStream(inputFilePath);
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let highlightQuery = "";
    let highlightEnd = "";

    if(isHighlighted)
    {
        highlightQuery = "<b style='background-color:" + highlightColor + "'>";
        highlightEnd = "</b>";
    }
    
    if(delimeter == "\t")
    {
        const reverso = new Reverso();
        for await (const line of rl) {
            reverso.getTranslation(
                line,
                inputLanguage,
                outputLanguage,
                (err, response) => {
                    if (err) throw new Error(err.message)
                    console.log(response);
                    //console.log(response.translations[0]);

                    let translation = highlightQuery + response.translations[0] + highlightEnd;
                    fs.appendFileSync(outputFolder +'/result.' + extension, highlightQuery + line + highlightEnd + "\t" + translation + os.EOL);
                })   
        }
    }
    else{
        const reverso = new Reverso();
        for await (const line of rl) {
            reverso.getTranslation(
                line,
                inputLanguage,
                outputLanguage,
                (err, response) => {
                    if (err) throw new Error(err.message)
                
                    let translation = highlightQuery + response.translations[0] + highlightEnd;
                    fs.appendFileSync(outputFolder +'/result.' + extension, highlightQuery + line + highlightEnd + delimeter + translation + os.EOL);
                })
    }
    
}
}

async function getOriginalWordWithExampleSentence(inputFilePath, outputFolder, extension, delimeter, inputLanguage, outputLanguage, highlightColor, isHighlighted)
{

    const fileStream = fs.createReadStream(inputFilePath);
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let highlightQuery = "";
    let highlightEnd = "";

    if(isHighlighted)
    {
        highlightQuery = "<b style='background-color:" + highlightColor + "'>";
        highlightEnd = "</b>";
    }
    
    if(delimeter == "\t")
    {
        const reverso = new Reverso();
        for await (const line of rl) {
            reverso.getContext(
                line,
                inputLanguage,
                outputLanguage,
                (err, response) => {
                    if (err) throw new Error(err.message)
                    console.log(response);
                    //console.log(response.translations[0]);

                    let example = response.examples[0].source.replace(line, highlightQuery + line + highlightEnd);
                    //let example = highlightQuery  + response.examples[0].source + highlightEnd;
                    fs.appendFileSync(outputFolder +'/result.' + extension, highlightQuery + line + highlightEnd + "\t" + example + os.EOL);
                })   
        }
    }
    else{
        const reverso = new Reverso();
        for await (const line of rl) {
            reverso.getContext(
                line,
                inputLanguage,
                outputLanguage,
                (err, response) => {
                    if (err) throw new Error(err.message)
                
                    let example = response.examples[0].source.replace(line, highlightQuery + line + highlightEnd);
                    //let example = highlightQuery  + response.examples[0].source + highlightEnd;
                    fs.appendFileSync(outputFolder +'/result.' + extension, highlightQuery + line + highlightEnd + delimeter + example + os.EOL);
                })
    }
    
}
}

async function getOnlyTranslation(inputFilePath, outputFolder, extension, inputLanguage, outputLanguage, highlightColor, isHighlighted)
{

    const fileStream = fs.createReadStream(inputFilePath);
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });


    let highlightQuery = "";
    let highlightEnd = "";

    if(isHighlighted)
    {
        highlightQuery = "<b style='background-color:" + highlightColor + "'>";
        highlightEnd = "</b>";
    }
    
    const reverso = new Reverso();
    for await (const line of rl) {
        reverso.getContext(
            line,
            inputLanguage,
            outputLanguage,
            (err, response) => {
                if (err) throw new Error(err.message)
                console.log(response);
                //console.log(response.translations[0]);
                let translation = highlightQuery + response.translations[0] + highlightEnd;
                //let example = highlightQuery  + response.examples[0].source + highlightEnd;
                fs.appendFileSync(outputFolder +'/result.' + extension, translation + os.EOL);
        })   
    }
}

async function getOnlyExample(inputFilePath, outputFolder, extension, inputLanguage, outputLanguage, highlightColor, isHighlighted)
{

    const fileStream = fs.createReadStream(inputFilePath);
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });


    let highlightQuery = "";
    let highlightEnd = "";

    if(isHighlighted)
    {
        highlightQuery = "<b style='background-color:" + highlightColor + "'>";
        highlightEnd = "</b>";
    }
    
    const reverso = new Reverso();
    for await (const line of rl) {
        reverso.getContext(
            line,
            inputLanguage,
            outputLanguage,
            (err, response) => {
                if (err) throw new Error(err.message)
                console.log(response);
                //console.log(response.translations[0]);
                let example = response.examples[0].source.replace(line, highlightQuery + line + highlightEnd);
                //let example = highlightQuery  + response.examples[0].source + highlightEnd;
                fs.appendFileSync(outputFolder +'/result.' + extension, example + os.EOL);
        })   
    }
}

async function getExampleSentenceWithWordTranslation(inputFilePath, outputFolder, extension, delimeter, inputLanguage, outputLanguage, highlightColor, isHighlighted)
{

    const fileStream = fs.createReadStream(inputFilePath);
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });


    let highlightQuery = "";
    let highlightEnd = "";

    if(isHighlighted)
    {
        highlightQuery = "<b style='background-color:" + highlightColor + "'>";
        highlightEnd = "</b>";
    }
    

    if(delimeter == "\t")
    {
        const reverso = new Reverso();
        for await (const line of rl) {
            reverso.getContext(
                line,
                inputLanguage,
                outputLanguage,
                (err, response) => {
                    if (err) throw new Error(err.message)
                    console.log(response);
                    //console.log(response.translations[0]);
                    let example = response.examples[0].source.replace(line, highlightQuery + line + highlightEnd);
                    //let example = highlightQuery  + response.examples[0].source + highlightEnd;
                    fs.appendFileSync(outputFolder +'/result.' + extension, example + "\t" + highlightQuery + line + highlightEnd + os.EOL);
            })   
        }
    }
    else{
        const reverso = new Reverso();
        for await (const line of rl) {
            reverso.getContext(
                line,
                inputLanguage,
                outputLanguage,
                (err, response) => {
                    if (err) throw new Error(err.message)
                    console.log(response);
                    //console.log(response.translations[0]);
                    let example = response.examples[0].source.replace(line, highlightQuery + line + highlightEnd);
                    //let example = highlightQuery  + response.examples[0].source + highlightEnd;
                    fs.appendFileSync(outputFolder +'/result.' + extension, example + delimeter + highlightQuery + line + highlightEnd + os.EOL);
            })   
        }
    }
    
}
    


app.whenReady().then(()=>{
    win = createWindow();

    ipcMain.handle('dialog', (event, method, params) => {
        return dialog[method](params);
    })

    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) createWindow();
    })

})

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') app.quit();
});