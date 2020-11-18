/*
 * Full Display includes:
 *     Expanding Bar Chart which shows insertions in a scaffold in Javascript on a browser.
 *     Insertions Plot
 *     Display Table
 *
 * Written by Omree Gal-Oz at the Arkin Lab, Lawrence Berkeley National Lab- Funded by
 * the BioDesign grant, under the U.S DOE
 *
 *  
 */



//FUNCTIONS

 /*
  * Global Vars:
  *     FD_Defaults
  *     MhtnDefaults 
  *     MH_data
  *     BCDefaults
  *     ebcScfInit
  *
  */

function NewFullDisplay() {
 /*
  * Global Vars:
  *     FD_Defaults
  *     MhtnDefaults 
  *     MH_data
  *     BCDefaults
  *     ebcScfInit
  *     organism_name
  *
  */

    // This global variable changes based on what we are displaying - This is not complete yet.
    window.main_data_obj = null;
    window.main_data_tracker = {"var_name": "undefined"};

    CreateFullDisplaySkeleton(FD_Defaults);
    
    // We start by showing stats display
    CreateStatsReportInDiv('entire-display-holder', statistics_d, StatsDefaults);
    

}

function CreateFullDisplaySkeleton(FD_Defaults) {

    // We create all the initial objects in "FullDisplay_Defaults"
    let full_disp_objs = FD_Defaults["lyt_vls"]; 
    let dobj_names_l = Object.keys(full_disp_objs);
    //dix - document object model object name index
    for (let dix = 0; dix < dobj_names_l.length; dix++) {
        dobj_info_d = full_disp_objs[dobj_names_l[dix]];
        LUCreateElementFromInfo(dobj_info_d)
    }

    // We create the multiple buttons used to create BarCharts
    CreateEBCTableInDiv(FD_Defaults, ebcScfInit );

    // Here we create onclick functions for Statistics Data & MH Plot

    let stats_dobj = document.getElementById('full-stats-btn')
    stats_dobj.onclick = function() {
        SwitchToStatsDisplay()

    }

    let MH_dobj = document.getElementById('full-mhtn-plot-btn')
    MH_dobj.onclick = function() {
        // TO DO: Import Manhattan data object and assign window.main_data_obj to it.
        // Below function is from the file "MhtnPlotExpandFuncs.js"
        SwitchToManhattanPlotDisplay()
    }


}

function CreateEBCTableInDiv(FD_Defaults, ebcScfInit) {
 /* 
  * We create a table of buttons to click on, like in MH plot expand
  * Args:
  *     FD_Defaults: (obj)
  *        lyt_vls:
  *             EBC_scflds_btns_holder_div:
  *                 id_i:
  *                     id: (str) ID of DOM object
  *        variable_layout_data:
  *             EBC_scf_btn_info
  *     ebcScfInit:
  *         scaffold_name (str) -> scaffold_file_name (str)
  *
  * Where are the EBC scaffold files contained?
  *     In EBC/DATA
  * 
  * The actual variables are named:
  *     scf_name + "EBC". 
  *     We need to remove a variable once it's no longer in use
  *         so we don't hold on to all the BC data all the time
  *
  *
  */
    let scf_names = Object.keys(ebcScfInit);
    let scf_EBC_row_info_d = FD_Defaults["variable_layout_data"]["EBC_scf_row_info"];
    let tbl = document.getElementById(FD_Defaults["lyt_vls"]["EBC_scflds_btns_table"]["id_i"]["id"]);


    // We iterate through each scaffold, giving it an entry in the table
    for (let r = scf_names.length - 1; r > -1; r --) {

            // Create an empty <tr> element and add it to the 1st position of the table:
            let row = tbl.insertRow(0);
            row.style.border = "1px solid black";
            let scf_name = scf_names[r];
            
            // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" 
            // <tr> element:
            let cell1 = row.insertCell(0);
            cell1.style.textAlign = "center";
            
            /*
            // First the ranking of scaffold in terms of length
            cell1.innerHTML = scf_names[r];
            // Then the scaffold name and link
            let scf_name = sc_l[r][0];
            console.log(scf_name);
            */
            let scf_link = document.createElement("a");
            scf_link.innerHTML = scf_name;
            scf_link.style.cursor = "pointer";
            scf_link.style.textDecoration = "underline";
            //scf_link.style.color = scf_to_color_obj[scf_name];
            // Here is where we set the on click function to open up that single scaffold's graph
            scf_link.onclick = function() {
                Display_Scaffold_EBC_from_name(scf_name, ebcScfInit)
            }
            scf_link.id = scf_EBC_row_info_d[
                                    "id_i"]["id_base"] + scf_name + "-link";
            //ScaffoldNameToValidHTMLID(scf_name) + "-link";
            cell1.appendChild(scf_link);
            //cell3.innerHTML = prep_int(sc_l[r][1]) + " bp";
        }
    /*
    for (let i = 0; i < scf_names.length; i++) {
        addEBCScaffoldButton(scf_names[i], ebcScfInit, scf_EBC_btn_info_d);
    }
    */

}

function Display_Scaffold_EBC_from_name(scf_name, ebcScfInit) {
 /* 
  * We need to provide the following data:
  *     BCdefaults (global), EBC_object (data), scf_name, organism_name
  *
  * Args:
  *     scf_name: (str)
  *     ebcScfInit:
  *         scaffold_name (str) -> scaffold_file_name (str)
  *
  */

    //current file name
    let c_fn = ebcScfInit[scf_name];

    let script_src = "JS/EBC/DATA/" + c_fn; 

    let scriptTarget = (document.getElementsByTagName('head')[
                            0] || document.getElementsByTagName('body')[0]);

    let newScript = document.createElement('script'); 
    newScript.type='text/javascript';
    newScript.async=true;
    newScript.id = scf_name + "-script-id";
    newScript.src= script_src;
    //console.log("script Target:");
    //console.log(scriptTarget);
    scriptTarget.appendChild(newScript);

    // data variable will be scf_name + "EBC"

    let func_str = "CreateInitialBCDisplay(BCdefaults, " + 
                        scf_name + "EBC, scf_name, organism_name)" ;

    newScript.addEventListener('load', function() {
        ClearEntireDisplay()
        eval(func_str); 
        ReplaceCurrentMainDataVariable(scf_name + "EBC", "EBC")
    });
}

function SwitchToStatsDisplay() {

        ClearEntireDisplay();
        // Below function is from the file "MakeStatsDiv.js"
        CreateStatsReportInDiv('entire-display-holder', statistics_d, StatsDefaults)

}

function SwitchToManhattanPlotDisplay() {

    
    if (!("MH_data" in window.main_data_tracker)) {
        // We have not yet imported the Manhattan plot
        let script_src = "JS/MH/MH_Data.js";
        let scriptTarget = (document.getElementsByTagName('head')[
                                0] || document.getElementsByTagName('body')[0]);

        let newScript = document.createElement('script'); 
        newScript.type='text/javascript';
        newScript.async=true;
        newScript.id = "MH-plot-data";
        newScript.src= script_src;
        scriptTarget.appendChild(newScript);

        window.main_data_tracker["MH_data"] = 1;

        // data variable will be scf_name + "EBC"

             
        let func_str = 'CreateMhtnDisplay(MhtnDefaults, ' + 
                        'FD_Defaults["lyt_vls"]["main_viz_div"], ' +
                           'MH_data)';

        newScript.addEventListener('load', function() {
            ClearEntireDisplay();
            eval(func_str); 
            //ReplaceCurrentMainDataVariable("MH_data", "Mhtn")
        });
    } else {

        // We have already imported the Manhattan plot
        let func_str = 'CreateMhtnDisplay(MhtnDefaults, ' + 
                        'FD_Defaults["lyt_vls"]["main_viz_div"], ' +
                           'MH_data)';

            ClearEntireDisplay();
            eval(func_str); 
    }

}

function ReplaceCurrentMainDataVariable(new_variable_name, type_str) {
 /* The point of this function is to clean up space by 
  * taking the existing main variable and removing it,
  * then marking the name of the new main variable
  * in a dict.
  * Args:
  *     new_variable_name: (str)
  *     type_str: (str)
  * Global args used:
  *     main_data_tracker: (d)
  *         var_name: main_variable_name (str)
  *         type: type_str (str)
  *             type_str ("Mhtn" or "EBC")
  *
  */
    let removal_str = "window." + main_data_tracker["var_name"] + "= null";
    eval(removal_str);
    main_data_tracker["var_name"] = new_variable_name;
    main_data_tracker["type_str"] = type_str;


}

function ClearEntireDisplay() {
    // Clear out original entire display holder 
        let entire_viz_div = document.getElementById("entire-display-holder") 

        while (entire_viz_div.firstChild) {
                entire_viz_div.removeChild(entire_viz_div.firstChild);
        }

}


function FullDispProgram() {
        /*
         *
         *
         *

    To Do:
        Make buttons- onclick load specific JS data

    Initiate original SVG
     Add functions to every rectangle which reset the SVG with new data set
     Create multiple data sets with python that can be used by this javascript
     List all necessary inputs from data object
     Create bar clicking visual (CSS)
     Create return to original state button

    Args:
     bar_data is a list of lists with format:
          [[insertion_right_bp (int), number_of_insertions (int)], ... ] 

        */

        // We load the basic display
        //
        console.log(ticks_data_d["organism_name"]);
        TestLoadDisplay();


        let x = GetDefaultVariables();
        let x_i = x[0];
        let y_i = x[1];
        let org = x[2];

        console.log("org:");
        console.log(org);

        // We load the insertions plot first
        let axes_lengths = CreateInsertionsPlotSVG(x_i, y_i, org);
        console.log(axes_lengths);
        let x_axis_length = axes_lengths[0];
        let y_axis_length = axes_lengths[1];


        // Adding the title
        let h = document.createElement("H1"); // Create the H1 element 
        h.style.left = (org[0] + x_axis_length/2 - 30).toString() + "px";
        h.style.top = "0px";
        h.innerHTML = "Insertions Plot"; 
        h.id = "graph-title";
        // let t = document.createTextNode(); // Create a text element 
        // h.appendChild(t); // Append the text node to the H1 element 
        document.body.appendChild(h); // Append the H1 element to the document body 

        /*
        let dv = document.createElement("div");
        dv.style.top = "50px";
        dv.style.width = "100%";
        dv.style.position = "absolute";
        dv.id = "svg-div";
        document.body.appendChild(dv)
        

        let svg = d3.select("#svg-div").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", 
                  "translate(" + margin.left + "," + (margin.top + 20) + ")");

         

        
        // This needs to start with the original input data- the highest observation point 
        // start_data = CreateData(data_viz_d, 0, data_viz_d["scaffold_length"]);
        // ResetSVG(start_data, width, height, margin);
        ResetSVG(ticks_data_d["start_data"]);
        */

         
}


function GetDefaultVariables() {

        let x_i = MhtnDefaults["x_i"];
        let y_i = MhtnDefaults["y_i"];
        let org = MhtnDefaults["org"];

        return [x_i, y_i, org];
}


function CreateInsertionsPlotSVG(x_i, y_i, org) {
    /*
     * Args:
     * x_i: Object, contains information re X axis
     * y_i: Object, contains information re Y axis
     * org: list<x_origin (Number), y_origin (Number)>
     * svg_i:
     *     width:
     *     height:
     *     scaffold_bool: (Bool) True if single scaffold, false otherwise.
     *
    */

    //First we clear the Display div:
    ClearDisplayDiv();

    // Then we create an SVG 
    let svg_obj = MakeSVGinDisplayDiv();

    let svg_i = {
        "width": svg_obj.offsetWidth,
        "height": svg_obj.offsetHeight,
        "scaffold_bool": false
    }

    // This function is from MhtnPlotExpand... will it work?
    let axes_lengths = MakeAllScaffoldsGraph(x_i, y_i, org, svg_i);

    return axes_lengths


}

function MakeSVGinDisplayDiv() {

    //Maybe use d3 instead...
    //
    //
    //


    let svg = d3.select("#central-display-div").append("svg")
            .attr("width", "100%")
            .attr("height", "100%" )
            .attr("border", "1px solid #F0F0F0")
            .attr("position", "absolute")
            .attr("id", "svg-obj")
            //
            //.attr("transform", 
            //      "translate(" + left + "," + top + ")")
            //.call(d3.zoom().on("zoom", function() {
            //    svg.attr("transform", d3.event.transform)
            //})
            //)
            .append("g");
        return svg

    /*
    let svg_obj = document.createElement("SVG")
    svg_obj.style.width = "100%";
    svg_obj.style.height = "100%";
    svg_obj.style.position = "absolute";
    svg_obj.id = "svg-obj";
    let display_div = document.getElementById("central-display-div");
    display_div.appendChild(svg_obj)

    return svg_obj
    */

}

function ClearDisplayDiv() {

    let display_div = document.getElementById("central-display-div");
    display_div.innerHTML = "";
}

function TestLoadDisplay() {
    
    let scaffold_names = Object.keys(ticks_data_d["scaffolds"])

    // Creating title for list to choose from

    let btns_ttl = document.createElement("H2");
    btns_ttl.innerHTML = "Expanding Bar Charts"
    btns_ttl.style.left = "50px";
    btns_ttl.style.top = "50px";
    btns_ttl.style.position = "absolute";
    document.body.appendChild(btns_ttl);

    // We create a central display div
    let central_display_div = document.createElement("DIV");
    central_display_div.style.top = "120px";
    central_display_div.style.width = "1000px";
    central_display_div.style.height = "800px";
    central_display_div.style.position = "absolute";
    central_display_div.style.left = "400px";
    central_display_div.style.border = "2px solid lightgray";
    central_display_div.style.overflow = "auto";
    central_display_div.id = "central-display-div"
    document.body.appendChild(central_display_div);

    // We create display button
    let display_ttl = document.createElement("H2");
    display_ttl.innerHTML = "Display"
    display_ttl.style.left = "600px";
    display_ttl.style.top = "50px";
    display_ttl.style.position = "absolute";
    document.body.appendChild(display_ttl);




    // Expanding Bar Charts div
    // We create a div to hold all the links to the 
    // expanding bar charts, load them in to a viewing area.
    let btn_holder_div = document.createElement("DIV");
    btn_holder_div.style.top = "120px";
    btn_holder_div.style.width = "275px";
    btn_holder_div.style.height = "300px";
    btn_holder_div.style.position = "absolute";
    btn_holder_div.style.left = "50px";
    btn_holder_div.style.overflow = "auto";
    btn_holder_div.style.border = "2px solid lightgray";
    document.body.appendChild(btn_holder_div);


    
    for (let i = 0; i < scaffold_names.length; i++) {

        let fst_b = document.createElement("btn");
        fst_b.style.position = "absolute";
        fst_b.style.top = (i*50).toString() + "px";
        fst_b.style.width = "272px";
        fst_b.style.left = "0px";
        fst_b.style.height = "50px";
        fst_b.style.border = "2px solid lightgray";
        fst_b.style.backgroundColor = "#F5F5F5";
        fst_b.style.cursor = "pointer";
        fst_b.onmouseover = function () {
            fst_b.style.backgroundColor = "white";
        };
        fst_b.onmouseout = function () {
            fst_b.style.backgroundColor = "#F5F5F5";
        };
        fst_b.style.textAlign = "center";
        fst_b.innerHTML = scaffold_names[i];
        btn_holder_div.appendChild(fst_b)
    
    }

    // Creating Insertions Plot Button: Button to make display insertions plot
    let inst_plot_btn = document.createElement("DIV");
    inst_plot_btn.style.top = "440px";
    inst_plot_btn.style.width = "275px";
    inst_plot_btn.style.height = "100px";
    inst_plot_btn.style.position = "absolute";
    inst_plot_btn.style.left = "50px";
    inst_plot_btn.style.textAlign = "center";
    inst_plot_btn.style.backgroundColor = "#F5F5F5";
    inst_plot_btn.style.border = "2px solid lightgray";
    inst_plot_btn.style.cursor = "pointer";
    inst_plot_btn.onmouseover = function () {
        inst_plot_btn.style.backgroundColor = "white";
    };
    inst_plot_btn.onmouseout = function () {
        inst_plot_btn.style.backgroundColor = "#F5F5F5";
    };
    inst_plot_btn.innerHTML = "Insertions Plot"
    document.body.appendChild(inst_plot_btn);


    // Creating Results Table Button: Button to have display show results table 
    let results_table_btn = document.createElement("DIV");
    results_table_btn.style.top = "560px";
    results_table_btn.style.width = "275px";
    results_table_btn.style.height = "100px";
    results_table_btn.style.position = "absolute";
    results_table_btn.style.left = "50px";
    results_table_btn.style.textAlign = "center";
    results_table_btn.style.backgroundColor = "#F5F5F5";
    results_table_btn.style.border = "2px solid lightgray";
    results_table_btn.style.cursor = "pointer";
    results_table_btn.onmouseover = function () {
        results_table_btn.style.backgroundColor = "white";
    };
    results_table_btn.onmouseout = function () {
        results_table_btn.style.backgroundColor = "#F5F5F5";
    };
    results_table_btn.innerHTML = "Results Table"
    document.body.appendChild(results_table_btn);



}

function ResetSVG(inp_data) {
     /* 
        inp_data: (d) must have the following keys:
            min_x: (int) (same as first index of first value of bar_data)
            max_x: (int) (same as second index of last value of bar_data)
            max_y: (int)
            bar_data is a list of lists with format:
                 [[insertion_left_bp, insertion_right_bp (int), number_of_insertions (int)], ... ] 
        The following lets should be global
        width: (int | float)
        height: (int | float)
        margin: (d)
            top: (int)   
            right: (int) 
            bottom: (int)
            left: (int)   
    */

    // Clear old SVG
    d3.selectAll("svg > *").remove();

    svg_obj = d3.select("svg")


    // Prepare tick locations for x and y axis
    let x_tick_values = [inp_data["min_x"]]
    for (let i = 0; i < inp_data["bar_data"].length; i++) {
        x_tick_values.push(inp_data["bar_data"][i][1])
    }
    let y_tick_values = GetProperTicks(0, inp_data["max_y"])

    CreateAxes(svg_obj, x_tick_values, y_tick_values, "Bp", "Num Insertions");
    
    SetBarRectData(svg_obj, inp_data);

}

function UpdateSVG(start_val, end_val) {
    /*
    We update data for chart using data from range given in input
    start_val: (int)
    end_val: (int)
    */

    CreateZoomOutButton(true);
    if (end_val - start_val > scaffold_range_threshold) {
        // Data should exist in input ticks_data_d because size too big
            
        scaffold_data_name = start_val.toString() + "-" + end_val.toString()

        ResetSVG(ticks_data_d[scaffold_data_name])

    } else {
        // Size small enough to compute
        barchart_data = CreateData(start_val, end_val, data_viz_d);
        ResetSVG(barchart_data);
    }


}


function CreateData(start_val, end_val, data_viz_d) {
    /*

    Args:
        data_viz_d:
            scaffold_name -> scaffold_info_d
                scaffold_info_d: (d)
                    scaffold_name:
                    scaffold_length:
                    positions:
                        position: str(int) -> 
                            {"nIns": number of insertions (int),
                            "+" or "-" -> position_info_d
                                position_info_d:
                                    "barcodes": list<str> each str a barcode of length 20,
                                    ["genes"]: {gene_id (str) -> gene_info_d}}
        start_val: (int)
        end_val: (int)

    Returns:
        barchart_data: (d) must have the following keys:
            min_x: (int) (same as first index of first value of bar_data)
            max_x: (int) (same as second index of last value of bar_data)
            max_y: (int)
            bar_data is a list of lists with format:
                 [[insertion_left_bp, insertion_right_bp (int), number_of_insertions (int)], ... ] 
    */

    tick_vals = GetProperTicks(start_val, end_val)


    bar_d_l = []

    for (i=0; i<tick_vals.length - 1; i++) {
        
        //ret_vals should be []
        let ret_vals = GetBarData(tick_vals[i], tick_vals[i + 1], data_viz_d)
        bar_d_l.push(ret_vals);
    }

    max_insertion_num = 0
    for (i=0; i<bar_d_l.length; i++) {
        if (bar_d_l[i][2] > max_insertion_num) {
            max_insertion_num = bar_d_l[i][2];
        }
    }

    
    barchart_data = {
        min_x: tick_vals[0],
        max_x: tick_vals[tick_vals.length - 1],
        bar_data: bar_d_l,
        max_y: max_insertion_num 
    };

    return barchart_data
}

function GetBarData(start_val, end_val, data_viz_d) {
    /* 
    start_val : int
    end_val : int
    data_viz_d
    Sum includes end_val, does not include start_val
    Returns:
        [start_val, end_val, num_insertions (int)]
    */


    num_insert = 0
    

    for (j = start_val + 1; j < end_val + 1; j++) {
        if (data_viz_d["positions"].hasOwnProperty(j.toString())) {
            num_insert += data_viz_d["positions"][j.toString()]["nIns"]
        }
    }


    return [start_val, end_val, num_insert]
    
}

function CreateAxes(svg_obj, x_ticks, y_ticks, x_label, y_label) {
            /*
            Here we create the axes - 
               svg_obj: the d3 svg object to which we append values
               x_ticks: list<int> The numbers in the axis 
               y_ticks: list<int> The numbers in the axis
               x_label: (str) Label for x axis
               y_label: (str) Label for y axis
            */
            let Xmin_num = x_ticks[0];
            let Xmax_num = x_ticks[x_ticks.length - 1];
            let Xdist = Xmax_num - Xmin_num;
            KB_bool = false;
            if (Xdist > 3000) {
                console.log("Present in KBs")
                KB_bool = true;
            }
            let Ymin_num = y_ticks[0];
            let Ymax_num = y_ticks[y_ticks.length -1];
            let Ydist = Ymax_num - Ymin_num;
            
            // First we create the axes themselves
            //X Axis
            svg_obj.append('line')
                .attr('x1', org[0])
                .attr('y1', org[1])
                .attr('x2', org[0] + x_axis_length)
                .attr('y2', org[1])
                .attr('stroke', 'black')
                .attr('stroke-width', 2);

            
            //Y Axis

            svg_obj.append('line')
                .attr('x1', org[0])
                .attr('y1', org[1])
                .attr('x2', org[0])
                .attr('y2', org[1] - y_axis_length)
                .attr('stroke', 'black')
                .attr('stroke-width', 2);


            // Labels
            // X-Axis Text Label
            svg_obj.append('text')
                .attr('font-weight', "bold")
                .attr('font-size', ticks_font_size + 10)
                .attr('x', org[0] + x_axis_length/2)
                .attr('y', org[1] + tick_length + text_dist + 30)
                .text(function() {
                    if (KB_bool) {
                        return "Location by KB";
                        } else {
                        return "Location by base-pair";
                        };
                    }
                );

            
 
            // Y-Axis Text Label

            //let rotateTranslate = d3.svg.transform().rotate(-180);
            // .attr("transform", "translate(0,0) rotate(180)")
            Yx = org[0] - 50
            Yy = org[1] - y_axis_length/2
            tsl = Yx.toString() + "," + Yy.toString()
            svg_obj.append('text')
                .attr('font-weight', "bold")
                .attr("transform", "translate(" + tsl + ") rotate(270)")
                .attr('font-size', ticks_font_size + 10)
                .text("# of Insertions");



            // We will make all the X ticks uniformly spread out
            // We make the ticks alternate in length


            //Then we add the ticks and text
            for (i=0; i < x_ticks.length; i++) {
                xtick = x_ticks[i];
                // We get X location
                // let x_loc = org[0] + x_axis_length*(xtick - Xmin_num)/Xdist;
                let x_loc = org[0] + x_axis_length*(i)/(x_ticks.length-1);


                //Add the tick

                svg_obj.append('line')
                    .attr('x1', x_loc)
                    .attr('y1', org[1])
                    .attr('x2', x_loc)
                    .attr('y2', org[1] + tick_length)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 2);

                // Add the text - Here is where we can change it to KB instead of base pair
                svg_obj.append('text')
                    .attr('font-weight', ticks_font_weight)
                    .attr('font-size', ticks_font_size)
                    .attr('x', x_loc)
                    .attr('y', org[1] + tick_length + text_dist)
                .text(function() {
                    if (KB_bool) {
                        return (xtick/1000).toString();
                        } else {
                            return xtick.toString();
                        };
                    }
                );

            }

            for (i=0; i < y_ticks.length; i++) {
                ytick = y_ticks[i];
                // We get y location
                let y_loc = org[1] - y_axis_length*(ytick - Ymin_num)/Ydist;

                //Add the tick

                svg_obj.append('line')
                    .attr('x1', org[0])
                    .attr('y1', y_loc)
                    .attr('x2',  org[0] - tick_length)
                    .attr('y2', y_loc)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 2);

                // Add the text

                svg_obj.append('text')
                    .attr('font-weight', ticks_font_weight)
                    .attr('font-size', ticks_font_size)
                    .attr('x',  org[0] - tick_length - text_dist - 5)
                    .attr('y', y_loc + 5)
                    .text(ytick.toString());

            }
        
        
}

function SetBarRectData(svg_obj, inp_data) {

    /*
    In this function we create all the rectangles to be inputted

    Args:
        svg_obj: d3 SVG Object
        inp_data: (d)
            min_x: (int)
            max_x: (int)
            max_y: (int)
            bar_data: a list of lists with format:
              [[insertion_left_bp (int), insertion_right_bp (int), number_of_insertions (int)], ... ] 

    In this function we create all the rectangles to be inputted
    x and y are d3 ScaleLinear objects
    width and height are ints
    svg_obj is an svg object from d3
    EACH BAR NEEDS TO BE ASSOCIATED WITH A FUNCTION THAT RESETS THE DATA VIEW-
    AN ONCLICK() ATTRIBUTE
    */



    let bar_data = inp_data["bar_data"]
    let num_vals = bar_data.length
   
    // We check if we're at single values
    if (bar_data[0][1] - bar_data[0][0] == 1) {
        x_start_loc = org[0] + x_axis_length/(num_vals*2);
        single_bp = true;
    } else {
        x_start_loc = org[0];
        single_bp = false;
    }


    // Here we create the empty rectangular objects
    svg_obj.selectAll(".bar")
              .data(bar_data)
              .enter()
              .append("g")
              .append("rect")
              .attr("class", "bar")
              .attr("x", function(d, i) { 
                    return x_start_loc + x_axis_length*i/num_vals;})
              .attr("width", x_axis_length/num_vals)
              .attr("y", function(d) { 
                    return GetScaledValue(d[2],
                "y", 0, inp_data["max_y"]); } )
              .attr("height", function(d) {
                scaled_y = GetScaledValue(d[2],
                "y", 0, inp_data["max_y"]);
                return org[1] - scaled_y; })
              .on("click", function(d) {
                    if  (!single_bp) {
                    back_up_list.push(d[0].toString() + "-" + d[1].toString());
                    UpdateSVG(d[0], d[1]);
                    } else {
                        g_info = data_viz_d["positions"][d[1].toString()]
                        Print_Position_Info(g_info);
                    }; 
                });

    


    // We add text 
    svg_obj.selectAll("g")
    .append("text")
    .attr("transform", 
          function(d, i) { 
              if (d[2] != 0) {
              text_x_loc = x_start_loc + x_axis_length*(i + .25)/num_vals;
              text_y_loc = GetScaledValue(d[2], "y", 0, inp_data["max_y"]) 
                    + 20;
              tsl_s = text_x_loc.toString() + "," + text_y_loc.toString()
              } else {
                  tsl_s = width.toString() + ",0" 
              }
              return "translate(" + tsl_s + ")";})
    .attr("font-size", "100%")
    .attr("fill", "white")
        .text(function(d) {

            return d[2].toString()

        });

}




function GetScaledValue(inp_N, axis_typ, min_val, max_val) {
    /*
    Args: inp_N is an integer
    axis_typ: (str) either "x" or "y"

    Returns:


    */
    if (axis_typ == "x") {
        return org[0] + x_axis_length*(inp_N - min_val)/(max_val - min_val);
    } else if (axis_typ == "y") {
        return org[1] - (y_axis_length*(inp_N - min_val)/(max_val - min_val));
    } else {
    console.log("Error- axis_typ must be 'x' or 'y'")
        return "Error"
    }

}

function GetProperTicks(start_val, end_val) {
    /*
    This function is to get properly spread ticks between
    two values, primarily on the y axis.

    Returns:
        ticks_list = [start_val, start_val + subdivs, start_val + 2subdivs,..., end_val]
    */
    subdivs = ConvertValueIntoSubDivs(end_val - start_val);
    tick_values = GetTickValues(start_val, end_val, subdivs);
    return tick_values;
}


function ConvertValueIntoSubDivs(Val) {
    /*
    Important Questions:
    1. Max ticks in axis assuming no more than 3 digits per value?
        Answer: 16
    2. Min ticks in axis?
        Answer: 8

    Meaning: 
        if N = d * 10^n, d > 5 implies division is 5 * 10^(n-2)
        4 < d < 5 implies division is  2.5 * 10^(n-2)
        2 < d < 4 implies division is  2 * 10^(n-2)
        1 < d < 2 implies division is 1 * 10^(n-2)
    */

    val_info = BaseNotation(Val, 10, 20);
    dig = val_info[0];
    power = val_info[1];

    if (power === 0) {
        subdivs = 1 ;
    } else {
            if (dig >=8) { 
            subdivs =  Math.pow(10,power);
            } else if (dig >= 6) { 
            subdivs = 5 * Math.pow(10, power-1);
            } else {
            subdivs = Math.floor(dig) * Math.pow(10, power-1);
            }
    }
    return subdivs;
}



function GetTickValues(start_val, end_val, subdivs) {

    /*We go from a value and subdivs to actual graph ticks


    Args:
        start_val: (int)
        end_val: (int)
        subdivs: (int)

    Returns:
        ticks_list = [start_val, start_val + subdivs, start_val + 2subdivs,...]

    Specifically, this function starts from start_val and adds subdiv until reaching
        end_val. Note that difference between start_val and end_val does not 
        need t
    */
    // First we get a list of just each tick, not the start and end ticks (no dbl)
    init_tick_list = [start_val];

    crnt_val = start_val + subdivs;

    while (crnt_val < end_val){
        init_tick_list.push(crnt_val);
        crnt_val = crnt_val + subdivs;
    }

    init_tick_list.push(end_val);


    return init_tick_list;

}


function BaseNotation(N, base, max_power) {

    /* We get power of base and digit multiplier.
        Eg. if N = 346, base = 10 we return [3.46, 2] because
            3.46 * 10^2 = 346 


    Args:
        N: int, number to find bounds for. MUST BE > 0
        base: int 
        max_power: int (limit so function doesn't run forever with while loop)

    Returns:
        [a, b (power of 10)] where a*10^b = N
        OR [-1, -1] if it failed for some reason

    */

    if (N <= 0) {
        return [-1, -1]
    }
    for (i=0; i < max_power + 1 ;i++){
        if (N >= Math.pow(base,i) && N < Math.pow(base,i+1)) {
            return [ N/Math.pow(base,i), i]
        }
    }

    return [-1, -1]

}

function Print_Position_Info(info_d) {
    /*
    This function gives info related to the barcode in a side panel.
    Important info: Strand, list of genes,
        a list of barcode sequences.

    Create a panel on the right of the SVG object

    Args:

       info_d: (d)
          "nIns": number of insertions (int),
          "+" or "-" -> position_info_d
              position_info_d:
                  "barcodes": list<str> each str a barcode of length 20,
                  ["genes"]: 
                    {gene_id (str) -> gene_info_d}
                    gene_info_d:
                        gene_pos_in_scaffold: (str) begin:end e.g. 
                            2345:3456
                        bc_pos_within_gene: (int) location of 
                            barcode within the gene
                        gene_length: (int)
                        bc_loc_percent_within_gene: (float) Starting 
                            position of insertion within gene
                        gene_desc: (str) Description of Gene
    */

    console.log("printing info")
    // FOR EACH STRAND we present information

    // strand_list will just be a list of the strands it appears on.
    
    strand_str = "";

    strands = ["+", "-"]
    strands.forEach(function(item, index) {
        if (Object.keys(info_d).includes(item)) { 
            strand_str += "<p>Strand: '" + item + "' </p>";
            strand_str += GetStrandHTMLText(info_d[item]);
        }
    })
    
    CreateSideScrollPanel(strand_str)
        

}

function GetStrandHTMLText(position_info_d) {
    /*
        Args:
            position_info_d: 
                  "barcodes": list<str> each str a barcode of length 20,
                  ["genes"]: 
                    {gene_id (str) -> gene_info_d}
                    gene_info_d:
                        gene_pos_in_scaffold: (str) begin:end e.g. 
                            2345:3456
                        bc_pos_within_gene: (int) location of 
                            barcode within the gene
                        gene_length: (int)
                        bc_loc_percent_within_gene: (float) Starting 
                            position of insertion within gene
                        gene_desc: (str) Description of Gene
        Returns:
            A string with p tags for spacing

        */

    
    barcodes_str = "<p>Barcodes: "
    if (Object.keys(position_info_d).includes("barcodes")) {
        barcodes_list = position_info_d["barcodes"];

        for (l=0; l<barcodes_list.length; l++) {
            barcodes_str += barcodes_list[l] + ", ";
        }
        // Removing the final comma and space
        barcodes_str = barcodes_str.slice(0, -2) + "</p>";
    }
    if (barcodes_str == "<p>Barcodes: ") {
                barcodes_str += " None</p>"
    }



    genes_str = "<p>Genes: </p>";
    if (Object.keys(position_info_d).includes("genes")) {
        genes_dict = position_info_d["genes"];
        gene_ids = Object.keys(genes_dict);
        for (l=0; l < gene_ids.length; l++ ) {
            gene_dict = genes_dict[gene_ids[l]]
                genes_str += " <p>Gene location in scaffold: " + gene_dict["gene_pos_in_scaffold"];
            genes_str += ". Barcode position in gene: " + gene_dict["bc_pos_within_gene"].toString();
            genes_str += ". Gene length: " + gene_dict["gene_length"].toString();
            genes_str += ". Barcode start percent of gene: " + 
                    (100*gene_dict["bc_loc_percent_within_gene"]).toString().slice(0,4) + "%" ;
                genes_str += ". Gene description: " + gene_dict["gene_desc"] + ".</p>  ";

        };
    }
    if (genes_str == "<p>Genes: </p>") {
                genes_str += "<p>None</p>"
    }

    return barcodes_str + genes_str;

}

function CreateSideScrollPanel(inp_str) {
    /*

    Args:
        inp_d (object):
            strand_str: (str)
            genes_str: (str)
            barcodes_str: (str)

    */

    //First remove original one: 
    st = document.getElementById("scroll-text")

    if (st) {
    document.body.removeChild(st)
    }

    scroll_p = document.createElement("div");
    new_style = "height:240px;width:240px;border:1px solid #ccc;";
    new_style +=  "font:16px/26px Georgia, Garamond, Serif;overflow:auto;";
    new_style += "position: absolute;"
    new_style += "left: " + (width + 150).toString() + "px;" + "top: " + margin.top.toString() + "px;";
    scroll_p.style =  new_style;
    scroll_p.id = "scroll-text"
    scroll_p.innerHTML = inp_str;
    document.body.appendChild(scroll_p);

}

function CreateZoomOutButton(create_btn_bool) {
    /*

    Args:
       create_btn_bool: (Boolean) If this is true, we create, false, remove 
    */

    //First get the original one: 
    st = document.getElementById("zoom-out-btn")

    if (st) {
        if (!create_btn_bool) {
            document.body.removeChild(st)
        }
    } else {
        if (create_btn_bool) {
            scroll_p = document.createElement("div");
            new_style = "height:50px;width:100px;border:1px solid #ccc;";
            new_style +=  "font:16px/26px Georgia, Garamond, Serif;background-color: #00FFFF;";
            new_style += "position: absolute; text-align:center;"
            new_style += "left: " + (width + 150).toString() + "px;" + "top: " + (margin.top + 500).toString() + "px;";
            scroll_p.style =  new_style;
            scroll_p.id = "zoom-out-btn"
            scroll_p.innerHTML = "<p>Zoom Out</p>";
            scroll_p.addEventListener('click', function (event) {
                ZoomOutView();    
                });
            document.body.appendChild(scroll_p);
        }
    }


    

}

function ZoomOutView() {
    /*
    We go backwards in the view as well as remove location text. Using the list
    "back_up_list": list<range_str>
    range_str: (str) start_val + "-" + end_val, e.g. "1400-1500"

    */

    //We remove location text if it exists 
    st = document.getElementById("scroll-text")

    if (st) {
    document.body.removeChild(st)
    }


    if (back_up_list.length > 1) {
        range_to_go = back_up_list[back_up_list.length - 2];
        back_up_list.pop();
        if (range_to_go == "start_data") {
            // We remove zoom out button
            CreateZoomOutButton(false)
            ResetSVG(ticks_data_d["start_data"])
        } else {
            start_val = parseInt(range_to_go.split("-")[0]);
            end_val = parseInt(range_to_go.split("-")[1]);
            UpdateSVG(start_val, end_val)
        }
    }

}

//export {FullDispProgram};

