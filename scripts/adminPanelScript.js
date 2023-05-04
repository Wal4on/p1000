const ip = "http://" + window.location.host;

document.getElementById("changeBtnCities").addEventListener(
    "click",
    (e) => {
        let nowStyle = document.getElementById("changeFormCities").style.display;
        if(nowStyle != "inline-flex") {
            document.getElementById("changeFormCities").style.display = "inline-flex";
        }
        else {
            document.getElementById("changeFormCities").style.display = "none";
        }
    }
)

document.getElementById("deleteBtnCities").addEventListener(
    "click",
    (e) => {
        let nowStyle = document.getElementById("deleteFormCities").style.display;
        if(nowStyle != "inline-flex") {
            document.getElementById("deleteFormCities").style.display = "inline-flex";
        }
        else {
            document.getElementById("deleteFormCities").style.display = "none";
        }
    }
)

document.getElementById("addBtnCities").addEventListener(
    "click",
    (e) => {
        let nowStyle = document.getElementById("addFormCities").style.display;
        if(nowStyle != "inline-flex") {
            document.getElementById("addFormCities").style.display = "inline-flex";
        }
        else {
            document.getElementById("addFormCities").style.display = "none";
        }
    }
)


const citiesAmount = document.getElementById("citiesLen").value;
for(let i = 1; i <= citiesAmount; i++) {
    document.getElementById("deleteCitySubmit"+i).addEventListener(
        "click",
        (e) => {
            const newName = document.getElementById("cityNameDel"+i).value;
            const cityData = document.getElementById("cityDataDel"+i).value;

            const data = JSON.stringify({ name: newName, data: cityData });

            fetch(ip+"/admin/delCity", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: data
            }).then(response => {
                window.location.replace('/');
            }).catch(error => {
                console.error('Ошибка:', error);
            });
        }
    )
}
for(let i = 1; i <= citiesAmount; i++) {
    document.getElementById("changeCitySubmit"+i).addEventListener(
        "click",
        (e) => {
            const selectEl = document.getElementById("change-city-products-select"+i);
            const selectedOptions = Array.from(selectEl.selectedOptions);
            const selectedValues = selectedOptions.map(option => option.value);

            const newName = document.getElementById("cityNameChange"+i).value;
            const cityData = document.getElementById("cityDataChange"+i).value;

            const data = JSON.stringify({ name: newName, data: cityData, products: selectedValues });

            fetch(ip+"/admin/changeCity", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: data
            }).then(response => {
                window.location.replace('/');
            }).catch(error => {
                console.error('Ошибка:', error);
            });
        }
    )
}


document.getElementById("addCitySubmit").addEventListener(
    "click",
    (e) => {
        const selectEl = document.getElementById("add-city-products-select");
        const selectedOptions = Array.from(selectEl.selectedOptions);
        const selectedValues = selectedOptions.map(option => option.value);

        const newName = document.getElementById("cityNameAdd").value;
        function translitRuEn(str){ var magic = function(lit){ var arrayLits = [ ["а","a"], ["б","b"], ["в","v"], ["г","g"], ["д","d"], ["е","e"], ["ё","yo"], ["ж","zh"], ["з","z"], ["и","i"], ["й","j"], ["к","k"], ["л","l"], ["м","m"], ["н","n"], ["о","o"], ["п","p"], ["р","r"], ["с","s"], ["т","t"], ["у","u"], ["ф","f"], ["х","h"], ["ц","c"], ["ч","ch"], ["ш","w"], ["щ","shh"], ["ъ","''"], ["ы","y"], ["ь","'"], ["э","e"], ["ю","yu"], ["я","ya"], ["А","A"], ["Б","B"], ["В","V"], ["Г","G"], ["Д","D"], ["Е","E"], ["Ё","YO"], ["Ж","ZH"], ["З","Z"], ["И","I"], ["Й","J"], ["К","K"], ["Л","L"], ["М","M"], ["Н","N"], ["О","O"], ["П","P"], ["Р","R"], ["С","S"], ["Т","T"], ["У","U"], ["Ф","F"], ["Х","H"], ["Ц","C"], ["Ч","CH"], ["Ш","W"], ["Щ","SHH"], ["Ъ",""], ["Ы","Y"], ["Ь",""], ["Э","E"], ["Ю","YU"], ["Я","YA"], ["0","0"], ["1","1"], ["2","2"], ["3","3"], ["4","4"], ["5","5"], ["6","6"], ["7","7"], ["8","8"], ["9","9"], ["a", "a"], ["b", "b"], ["c", "c"], ["d", "d"], ["e", "e"], ["f", "f"], ["g", "g"], ["h", "h"], ["i", "i"], ["j", "j"], ["k", "k"], ["l", "l"], ["m", "m"], ["n", "n"], ["o", "o"], ["p", "p"], ["q", "q"], ["r", "r"], ["s", "s"], ["t", "t"], ["u", "u"], ["v", "v"], ["w", "w"], ["x", "x"], ["y", "y"], ["z", "z"], ["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"], ["E", "E"], ["F", "F"], ["G", "G"], ["H", "H"], ["I", "I"], ["J", "J"], ["K", "K"], ["L", "L"], ["M", "M"], ["N", "N"], ["O", "O"], ["P", "P"], ["Q", "Q"], ["R", "R"], ["S", "S"], ["T", "T"], ["U", "U"], ["V", "V"], ["W", "W"], ["X", "X"], ["Y", "Y"], ["Z", "Z"] ]; var efim360ru = arrayLits.map(i=>{if (i[0]===lit){return i[1]}else{return undefined}}).filter(i=>i!=undefined); if (efim360ru.length>0){return efim360ru[0]} else{return "-"} }; return Array.from(str).map(i=>magic(i)).join("") }
        
        const newData = translitRuEn(newName).toLowerCase().split("-").join("");
        if(newData === "") return;

        const data = JSON.stringify({ name: newName, data: newData, categories: selectedValues });

        fetch(ip+"/admin/addCity", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        }).then(response => {
            window.location.replace('/');
        }).catch(error => {
            console.error('Ошибка:', error);
        });
    }
)


document.getElementById("deleteBtnProducts").addEventListener(
"click",
(e) => {
    let nowStyle = document.getElementById("deleteFormProducts").style.display;
    if(nowStyle != "inline-flex") {
        document.getElementById("deleteFormProducts").style.display = "inline-flex";
    }
    else {
        document.getElementById("deleteFormProducts").style.display = "none";
    }
});
document.getElementById("addBtnProducts").addEventListener(
"click",
(e) => {
    let nowStyle = document.getElementById("addFormProducts").style.display;
    if(nowStyle != "inline-flex") {
        document.getElementById("addFormProducts").style.display = "inline-flex";
    }
    else {
        document.getElementById("addFormProducts").style.display = "none";
    }
});


const productsAmount = document.getElementById("productsLen").value;
for(let i = 1; i <= productsAmount; i++) {
    document.getElementById("deleteProductSubmit"+i).addEventListener(
    "click",
    (e) => {
        const newName = document.getElementById("productNameDel"+i).value;
        const productData = document.getElementById("productDataDel"+i).value;

        const data = JSON.stringify({ name: newName, data: productData });

        fetch(ip+"/admin/delProduct", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        }).then(response => {
            window.location.replace('/');
        }).catch(error => {
            console.error('Ошибка:', error);
        });
    });
}

document.getElementById("addProductSubmit").addEventListener(
"click",
(e) => {
    const newName = document.getElementById("productNameAdd").value;
    let newPrice = "";

    const amounts = ["0.25", "0.3", "0.5", "1", "1.5", "2", "5", "10"];

    for(let productPriceIndex = 1; productPriceIndex <= 8; productPriceIndex++) {
        let amountValue = document.getElementById("productPriceAdd"+productPriceIndex).value;
        if(amountValue == "") amountValue = null;
        newPrice += amounts[productPriceIndex-1]+"-"+amountValue;
        if(productPriceIndex+1 <= 8) newPrice+="|";
    }


    function translitRuEn(str){ var magic = function(lit){ var arrayLits = [ ["а","a"], ["б","b"], ["в","v"], ["г","g"], ["д","d"], ["е","e"], ["ё","yo"], ["ж","zh"], ["з","z"], ["и","i"], ["й","j"], ["к","k"], ["л","l"], ["м","m"], ["н","n"], ["о","o"], ["п","p"], ["р","r"], ["с","s"], ["т","t"], ["у","u"], ["ф","f"], ["х","h"], ["ц","c"], ["ч","ch"], ["ш","w"], ["щ","shh"], ["ъ","''"], ["ы","y"], ["ь","'"], ["э","e"], ["ю","yu"], ["я","ya"], ["А","A"], ["Б","B"], ["В","V"], ["Г","G"], ["Д","D"], ["Е","E"], ["Ё","YO"], ["Ж","ZH"], ["З","Z"], ["И","I"], ["Й","J"], ["К","K"], ["Л","L"], ["М","M"], ["Н","N"], ["О","O"], ["П","P"], ["Р","R"], ["С","S"], ["Т","T"], ["У","U"], ["Ф","F"], ["Х","H"], ["Ц","C"], ["Ч","CH"], ["Ш","W"], ["Щ","SHH"], ["Ъ",""], ["Ы","Y"], ["Ь",""], ["Э","E"], ["Ю","YU"], ["Я","YA"], ["0","0"], ["1","1"], ["2","2"], ["3","3"], ["4","4"], ["5","5"], ["6","6"], ["7","7"], ["8","8"], ["9","9"], ["a", "a"], ["b", "b"], ["c", "c"], ["d", "d"], ["e", "e"], ["f", "f"], ["g", "g"], ["h", "h"], ["i", "i"], ["j", "j"], ["k", "k"], ["l", "l"], ["m", "m"], ["n", "n"], ["o", "o"], ["p", "p"], ["q", "q"], ["r", "r"], ["s", "s"], ["t", "t"], ["u", "u"], ["v", "v"], ["w", "w"], ["x", "x"], ["y", "y"], ["z", "z"], ["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"], ["E", "E"], ["F", "F"], ["G", "G"], ["H", "H"], ["I", "I"], ["J", "J"], ["K", "K"], ["L", "L"], ["M", "M"], ["N", "N"], ["O", "O"], ["P", "P"], ["Q", "Q"], ["R", "R"], ["S", "S"], ["T", "T"], ["U", "U"], ["V", "V"], ["W", "W"], ["X", "X"], ["Y", "Y"], ["Z", "Z"] ]; var efim360ru = arrayLits.map(i=>{if (i[0]===lit){return i[1]}else{return undefined}}).filter(i=>i!=undefined); if (efim360ru.length>0){return efim360ru[0]} else{return "-"} }; return Array.from(str).map(i=>magic(i)).join("") }
    
    const newData = translitRuEn(newName).toLowerCase().split("-").join("");
    if(newData === "") return;

    const data = JSON.stringify({ name: newName, data: newData, price: newPrice });

    fetch(ip+"/admin/addProduct", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    }).then(response => {
        window.location.replace('/');
    }).catch(error => {
        console.error('Ошибка:', error);
    });
});




document.getElementById("openCitiesPanel").addEventListener(
    "click",
    (e) => {
        let nowStyle = document.getElementById("citiesPanel").style.display;
        if(nowStyle != "block") {
            document.getElementById("citiesPanel").style.display = "block";
        }
        else {
            document.getElementById("citiesPanel").style.display = "none";
        }
    }
)
document.getElementById("openProductsPanel").addEventListener(
    "click",
    (e) => {
        let nowStyle = document.getElementById("productsPanel").style.display;
        if(nowStyle != "block") {
            document.getElementById("productsPanel").style.display = "block";
        }
        else {
            document.getElementById("productsPanel").style.display = "none";
        }
    }
)

document.getElementById("openPhotosPanel").addEventListener(
    "click",
    (e) => {
        let nowStyle = document.getElementById("photosPanel").style.display;
        if(nowStyle != "block") {
            document.getElementById("photosPanel").style.display = "block";
        }
        else {
            document.getElementById("photosPanel").style.display = "none";
        }
    }
)

function logSelectedOptionAmounts() {
    const selectElements = document.getElementsByClassName("productSelect");
    for(const selectedElem of selectElements) {
        selectedElem.addEventListener('change', (e) => {
            const selectedValue = e.target.value;
    
            const options = document.getElementsByClassName("amountSelect").length;
    
            for(let optIndex = 0; optIndex < options; optIndex++) {
                document.getElementsByClassName("amountSelect")[optIndex].style.display = "none";
            }
    
            let placeProduct = document.getElementById("amountSelect"+selectedValue);
            let nowStyle = placeProduct.style.display;
            if(nowStyle != "block") {
                document.getElementById("amountSelect"+selectedValue).style.display = "block";
            }
            else {
                document.getElementById("amountSelect"+selectedValue).style.display = "none";
            }
        
        });
    }
    selectElements[0].dispatchEvent(new Event("change"));

    // document.getElementsByClassName("amountSelect")[0].style.display = "block";
}
logSelectedOptionAmounts();
function logSelectedOptionPlaces() {
    const selectElement = document.getElementById("placeSelect");
    selectElement.addEventListener('change', (e) => {
        const selectedValue = e.target.value;

        const options = document.getElementsByClassName("productSelect").length;

        for(let optIndex = 0; optIndex < options; optIndex++) {
            document.getElementsByClassName("productSelect")[optIndex].style.display = "none";
        }

        let placeProduct = document.getElementById(selectedValue+"Select");
        let nowStyle = placeProduct.style.display;
        if(nowStyle != "block") {
            document.getElementById(selectedValue+"Select").style.display = "block";
            // const se = document.getElementsByClassName("productSelect");
            document.getElementById(selectedValue+"Select").dispatchEvent(new Event("change"));
        }
        else {
            document.getElementById(selectedValue+"Select").style.display = "none";
        }
    
    });

    document.getElementsByClassName("productSelect")[0].style.display = "block";
}
logSelectedOptionPlaces();



const inStockAmount = document.getElementById("inStockLen").value;
for(let i = 1; i <= inStockAmount; i++) {
    document.getElementById("btnSpan"+i).addEventListener(
        "click",
        (e) => {
            const mongId = document.getElementById("mongId"+i).value;

            const data = JSON.stringify({ mongId: mongId });

            fetch(ip+"/admin/delCandy", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: data
            }).then(response => {
                window.location.replace('/');
            }).catch(error => {
                console.error('Ошибка:', error);
            });
        }
    )
}