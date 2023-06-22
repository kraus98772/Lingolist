
let theme;

function saveJsonFile() {
  console.log(theme);
  window.bridge.saveData(theme);
}

function generateFile()
{
  selectedOptions[6].value = getHighlightColor();
  window.bridge.generateFile(selectedOptions);
  console.log(selectedOptions);
}

function getHighlightColor()
{
  return document.getElementById("colorpickerInput").value;
}

let settingsOpened = false;

document.getElementById("settings-button").addEventListener("click", () => {
  if(!settingsOpened)
  {
    document.getElementById("settings-container").style.display = "flex";
    settingsOpened = true;
  }else{
    document.getElementById("settings-container").style.display = "none"
    settingsOpened = false;
  }

});

document.getElementById("generate-button").addEventListener("click", generateFile);

//document.getElementById("butt").addEventListener("click", saveJsonFile);

window.bridge.sendConfig((event, config) => {
  //console.log(config);
  theme = config;
  if(config == "Dark")
  {
    setDarkMode();
  }else
  {
    setLightMode();
  }

});

const dialogConfigInput = {
  title: "Select a file",
  buttonLabel: "This one will do",
  properties: ['openFile'],
  filters: [{name: "Text File", extensions: ['txt']}]
};

const dialogConfigOutput = {
  title: "Select a file",
  buttonLabel: "This one will do",
  properties: ['openDirectory'],
};

let selectedOptions = [
  {name: "input-file", value: ""},
  {name: "output-folder", value: ""},
  {name: "output-type", value: "only-t"},
  {name: "output-format", value: "tsv", delimeter: "\t"},
  {name: "input-language", value: "spanish"},
  {name: "output-language", value: "english"},
  {name: "highlight", value: "#abcdef", isChecked: false}
]

document.getElementById("noHighlight").addEventListener("click", () => {
  selectedOptions[6].isChecked = !selectedOptions[6].isChecked;
  console.log(selectedOptions[6].isChecked)
})

let optionsAmount = selectedOptions.length;

document.getElementById("select-file-input").addEventListener('click', () => {
  bridge.openDialog('showOpenDialog', dialogConfigInput)
  .then(result => selectedOptions[0].value = result.filePaths[0])
  .then(() => document.getElementById("value-input").innerHTML = selectedOptions[0].value);
});

document.getElementById("select-file-output").addEventListener('click', () => {
  bridge.openDialog('showOpenDialog', dialogConfigOutput)
  .then(result => selectedOptions[1].value = result.filePaths[0])
  .then(() => document.getElementById("value-output").innerHTML = selectedOptions[1].value);
});

const options = document.getElementsByClassName("option");

Array.prototype.forEach.call(options, option => {
  option.addEventListener('click',() => {
    let parentId = option.parentElement.id.replace("-select", "");
    let parentDiv = document.getElementById(parentId);
    parentDiv.getElementsByClassName("value")[0].innerHTML = option.innerHTML;
    
    for(var i = 0; i < optionsAmount; i++)
    {
      if(selectedOptions[i].name == parentId)
      {
        selectedOptions[i].value = option.getAttribute("value");
      }

      if(parentId == "output-format")
      {
        selectedOptions[3].delimeter = option.getAttribute("delimeter");
      }
    }

    closeSelection(parentId);
    for(let j = 0; j < fieldsAmount; j++)
      {
        if(openableFields[j].name == parentId){
        openableFields[j].opened = false;
        }
      }
  })
});

let openableFields = [
  {name:"output-type", opened: false},
  {name:"output-format", opened: false},
  {name:"input-language", opened: false},
  {name:"output-language", opened: false}
]

let fieldsAmount = openableFields.length;

for(let i = 0; i < fieldsAmount; i++)
{
  document.getElementById(openableFields[i].name).addEventListener('click', () => {
    if(!openableFields[i].opened)
    {
      for(let j = 0; j < fieldsAmount; j++)
      {
        closeSelection(openableFields[j].name);
        openableFields[j].opened = false;
      }
      openSelection(openableFields[i].name);
      openableFields[i].opened = true;
    }
    else{
      closeSelection(openableFields[i].name);
      openableFields[i].opened = false;
    }
  });
}

function openSelection(name)
{
  document.getElementById(name + "-select").style.display = "flex";
}

function closeSelection(name)
{
  document.getElementById(name + "-select").style.display = "none";
}

let light_switch = document.getElementById("light_switch");

function setDarkMode()
{
  document.body.style.backgroundColor = "black";
  document.body.style.color = "aliceblue";
  light_switch.setAttribute('src', "dark_mode.svg");
}

function setLightMode()
{
  document.body.style.backgroundColor = "aliceblue";
  document.body.style.color = "black";
  light_switch.setAttribute('src', "light_mode.svg");
}

light_switch.addEventListener('click', () => {

  if(light_switch.getAttribute('src').toString() == "light_mode.svg")
  {
    theme = "dark";
    setDarkMode();
  }
  else
  {
    theme = "light";
    setLightMode();
  }

  saveJsonFile()
});
