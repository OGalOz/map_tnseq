// This file is created to contain functions that aid with
// creating an organized layout for a page.


function LUaddBasicLayout(DOM_object, basic_layout_d) {
/*
 *  This function takes an existing DOM object with a parent
 *      DOM object and defines its foundational layout
 *      pieces such as left, top, height, width
 * Args: 
 *      DOM_object is a Document Object Model object
 *      basic_layout_d is an object with the following keys:
 *          values_type: (str) "fixed" or "fractions"
 *          l: (num) left or null
 *          t: (num) top or null
 *          h: (num) height or null
 *          w: (num) width or null
 */

    let lft = null;
    let tp = null;
    let ht = null;
    let wd = null;
    if (basic_layout_d["values_type"] === "fractions") {
        CheckFracValues(basic_layout_d);
        let parent_DOM_elem = DOM_object.parentElement;
        if (!(parent_DOM_elem === undefined ||  parent_DOM_elem === null)) {
            // Note: we subtract 1 from height and width because of a seeming extension that occurs.
            if (!(basic_layout_d["l"] === null)) {
                lft = parent_DOM_elem.clientWidth*basic_layout_d["l"] - 1;
            }
            if (!(basic_layout_d["t"] === null)) {
                tp = parent_DOM_elem.clientHeight*basic_layout_d["t"] - 1;
            }
            if (!(basic_layout_d["h"] === null)) {
                ht = parent_DOM_elem.clientHeight*basic_layout_d["h"]-1;
            }
            if (!(basic_layout_d["w"] === null)) {
                wd = parent_DOM_elem.clientWidth*basic_layout_d["w"]-1;
            }
        } else {
            throw "In add basic layout, the DOM_object has no parent element"
        }
    } else if (basic_layout_d["values_type"] === "fixed") {
        if (!(basic_layout_d["l"] === null)) {
            lft= basic_layout_d["l"];
        }
        if (!(basic_layout_d["t"] === null)) {
            tp = basic_layout_d["t"];
        }
        if (!(basic_layout_d["h"] === null)) {
            ht = basic_layout_d["h"];
        }
        if (!(basic_layout_d["w"] === null)) {
            wd = basic_layout_d["w"];
        }
    } else {
        throw "value type must be either 'fractions' or 'fixed'"
    }

    LUAddLayoutSizeLocToDOMObj(DOM_object, lft, tp, ht, wd);

    return DOM_object

}

function LUAddLayoutSizeLocToDOMObj(DOM_obj, lft, tp, ht, wd) {
    if (!(lft === null)) {
        DOM_obj.style.left = lft.toString() + "px";
    }
    if (!(tp === null)) {
        DOM_obj.style.top =  tp.toString() + "px";
    }
    if (!(ht === null)) {
        DOM_obj.style.height = ht.toString() + "px";
    }
    if (!(wd === null)) {
        DOM_obj.style.width = wd.toString() + "px";
    }
}



function LUAddStyleToDOMObj(DOM_obj, style_d) {
    // For each key in style_d object
    // we add that style to the DomObject
    style_vals = Object.keys(style_d);
    for (let i = 0; i < style_vals.length; i++) {
        key = style_vals[i];
        func_str = "DOM_obj.style." + key + ' = "' + style_d[key] + '";';
        eval(func_str); 
    }
}


function LUAddPropertiesToDOMObj(DOM_obj, property_d) {

        // For each key in property_d object
        //
        //     // we add that property to the DomObject
        //
        //         // e.g. property_d:
        //
        //             //   target: "_blank"
        
    let property_vals = Object.keys(property_d);
      
    for (let i = 0; i < property_vals.length; i++) {
      
        let key = property_vals[i];
    
        let func_str = "DOM_obj." + key + ' = "' + property_d[key] + '";';
    
        eval(func_str); 
      
    }
      
}


function LUAddElementToParent(DOM_obj, parent_id) {
    document.getElementById("#" + parent_id).appendChild(DOM_obj);
}

function LUCreateElementFromInfo(inp_obj) {
    /*
     *
     * Args:
     *     inp_obj:
     *         tag_type: (str)
     *         id_i: (obj)
     *              parent_id: (str)
     *              id: (str)
     *         size_loc_i: (obj) Contains location (height, etc. info)
     *         style_i: (obj) Contains stylistic info.
     *         [unq_prp]: (obj) Contains properties unique to this element.
     */
    let current_DOM_elem = document.createElement(inp_obj["tag_type"]);
    id_i = inp_obj["id_i"];
    current_DOM_elem.id = id_i["id"];

    let parent_id = id_i["parent_id"];
    let parent_DOM_elem = null;
    if (parent_id != "body") {
        parent_DOM_elem = document.getElementById(id_i["parent_id"])
    } else {
        parent_DOM_elem = document.getElementsByTagName("BODY")[0];
    }

    if (parent_DOM_elem == null || parent_DOM_elem == undefined) {
        console.log("No parent Dom element")
        console.log(id_i);
        console.log(inp_obj);
        throw "No parent DOM object"
    }

    parent_DOM_elem.appendChild(current_DOM_elem);
    LUaddBasicLayout(current_DOM_elem, inp_obj["size_loc_i"]);
    LUAddStyleToDOMObj(current_DOM_elem, inp_obj["style_i"]);
    if ("unq_prp" in inp_obj) {
        LUAddPropertiesToDOMObj(current_DOM_elem, inp_obj["unq_prp"])
    }

    return current_DOM_elem;

}

function CheckFracValues(basic_layout_d) {
 /* In this function we check if the values in the layout dict are indeed
  * fractions (between 0 and 1) 
 *      basic_layout_d is an object with the following keys:
 *          values_type: (str) "fixed" or "percentage"
 *          l: (f)
 *          t: (f)
 *          h: (f)
 *          w: (f)
 */
    let key_list = ["l","t","h","w"];
    key_list.forEach(function (item, index) {
        if (!(basic_layout_d[item] > -0.01 && basic_layout_d[item] < 1.01)){
            throw "Error with fraction value " + item + ": " + basic_layout_d[item].toString();
        }
    });
}


function prepInt(inp_i) {
 //    inp_i is an int or float with no decimal nonzero digits, value will be converted into
 //    string and have commas: 1000000 -> '1,000,000'
 //    OR inp_i is '?' or null or undefined
    
 //    converting floats into ints and ints into strings and strings into lists
 //

    let x = null;
    if (inp_i != '?' && inp_i != null && inp_i != undefined) {
        x = inp_i.toString().split("");
    } else {
        console.log("inp_i : " + inp_i.toString());
        return '?'
    }

    let op_str = ''
    while (x.length > 3) {
        let c_char = x[0];
        x = x.slice(1);
        op_str += c_char;
        if (x.length % 3 == 0) {
            op_str += ","
        }
    }

    op_str += x.join(""); 

    return op_str

}


function FracToPrcString(flt) {
    // flt is a fraction to be turned into percent and cut short to 3 decimals
    // returns string
    if (flt <= 1.01 && flt > -0.01) {
        flt = (flt*100).toString();
    } else {

        return "Percent Error? " + flt.toString()
    }

    // We split the float into before decimal and after
    let l = null
    if (flt.includes(".")) {
        l = flt.split(".");
    } else {
        l = [flt, "0"];
    }
    console.log(l)

    // We round the after-decimal part
    let ad = l[1].slice(0,2)
    if (parseInt(ad[-1]) > 4) {
        ad = (ad[0] + 1).toString();
    } else {
        ad = ad[0].toString();
    }

    let op = l[0] + "." + ad;

    return op
}
