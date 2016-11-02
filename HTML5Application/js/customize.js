jQuery.fn.dataTableExt.oApi.fnSearchHighlighting = function(oSettings) {
    // Initialize regex cache
    oSettings.oPreviousSearch.oSearchCaches = {};

    oSettings.oApi._fnCallbackReg( oSettings, 'aoRowCallback', function( nRow, aData, iDisplayIndex, iDisplayIndexFull) {

        // Initialize search string array
        var searchStrings = [];
        var oApi = this.oApi;
        var cache = oSettings.oPreviousSearch.oSearchCaches;
        // Global search string
        // If there is a global search string, add it to the search string array
        if (oSettings.oPreviousSearch.sSearch) {
            searchStrings.push(oSettings.oPreviousSearch.sSearch);
        }
        // Individual column search option object
        // If there are individual column search strings, add them to the search string array
        if ((oSettings.aoPreSearchCols) && (oSettings.aoPreSearchCols.length > 0)) {
            for (var i in oSettings.aoPreSearchCols) {
                if (oSettings.aoPreSearchCols[i].sSearch) {
                    searchStrings.push(oSettings.aoPreSearchCols[i].sSearch);
                }
            }
        }
        // Create the regex built from one or more search string and cache as necessary
        if (searchStrings.length > 0) {
            var sSregex = searchStrings.join("|");
            if (!cache[sSregex]) {
                var regRules = "("
                    ,   regRulesSplit = sSregex.split(' ');

                regRules += "("+ sSregex +")";
                for(var i=0; i<regRulesSplit.length; i++) {
                    regRules += "|("+ regRulesSplit[i] +")";
                }
                regRules += ")";

                // This regex will avoid in HTML matches
                cache[sSregex] = new RegExp(regRules+"(?!([^<]+)?>)", 'ig');
            }
            var regex = cache[sSregex];
        }
        // Loop through the rows/fields for matches
        jQuery('td', nRow).each( function(i) {
            // Take into account that ColVis may be in use
            var j = oApi._fnVisibleToColumnIndex( oSettings,i);
            var dataIndex = oSettings.aoColumns[j].data;
            var data = aData[dataIndex];

            // check if data mapping has worked, otherwise use numerical index of columns
            if (!data) {
                data = aData[j];
            }
console.log(data);
            // Only try to highlight if the cell is not empty or null
            if (data) {
                // If there is a search string try to match
                if ((typeof sSregex !== 'undefined') && (sSregex)) {
                    this.innerHTML = data.replace( regex, function(matched) {
                        return "<span class='filterMatches'>"+matched+"</span>";
                    });
                }
                // Otherwise reset to a clean string
                else {
                    this.innerHTML = data;
                }
            }
        });
        return nRow;
    }, 'row-highlight');
    return this;
};





toastr.options.timeOut = 40;
var loginid =0;
$("#search2").hide();
$(".remove").hide();
$("#custom").children(".panel-heading").click(function(){
    $(this).siblings(".panel-body").slideToggle();
});
$("#custom").children(".panel-body").hide();
authenticate();
logout();

db = ["emp", "family", "edu", "addr"];
offset = [2, 3, 2, 3];
cols_sql = getColumns(db, offset);
choice_cols = ["sex", "rental", "house", "cohabit", "care"];
//Display names for columns in the UI - Hardcoded
var col_disp_name = {
    "Employee_personal_details": ["EMPLOYEE_NAME", "SEX", "BIRTHDAY","TELEPHONE_NUMBER", "EMERGENCY_CONTACT_NAME", "EMERGENCY_CONTACT_ADDR", "EMERGENCY_CONTACT_NO", "PASSPORT_NUMBER", "PASSPORT_DATE", "PASSPORT_NAME", "RENTAL","NATIONALITY"],
    "Family_Members_and_Information": [ "MEMBER_SEX", "MEMBER_BIRTHDAY", "RELATION", "TYPE_OF_COHABITATION", "TYPE_OF_CARE"],
    "Educational_details": ["SCHOOL_NAME", "MAJOR_SPECIALIZATION", "YEAR_OF_GRADUATION"],
    "Address_information": ["STATE", "CITY", "STREET", "BUILDING_NAME/NUMBER", "HOUSE"],
};
var col_name = Object.keys(cols_sql);
var col_disp = Object.keys(col_disp_name);
var tab_del_name = "";
var tab_crt_name = "";
var tab_open_name = "";
var tab_id = 0;
var col_name1 ="";

var emps = [];
var cnt = 0;
var tname = "";

var data_id = [];
var query_table = [];
var query_cols = [];
var query_pairs = [];
var query_disp = [];
var a = 0;
chooseCols();
configureTables();
chooseTable();

addTables($("#crtd_table"));
addTables($("#disp_table"));
addTables($("#svd_table"));
viewTable();
openTable();
saveTable();
deleteTable();
appendSelectDB(col_name, col_disp);


$("#delete").click(function () {
    dropTables($(this));
});
$("#create").click(function ()
{
    createNewTable();
});
$("#open").click(function(){
  //createNewTable();
   EditTable($(this)); 
});
var tableset = {};
getTableSetData();
$("#table_names").children("#table_title").click(function () {
    ($("#tab_name").attr("placeholder", "Type your table name"));
    createTableAttr($(this));
});

$(".display").children("#generate").click(function () {
    
    var st = "select emp.number, emp.id, ";
    query_table = [];
    query_cols = [];
    query_disp = ["EMPLOYEE ID", "EMPLOYEE NUMBER"];
    query_pairs = formQueryPairs();
    if (query_table.length == 0)
    {
        var q1 = $.url().param('q1');
        $('input[name="q1"]').val(q1);
        var q2 = $.url().param('q2');
        $('input[name="q2"]').val(q2);

        // read data from database
        var emps;
        if (q1) {
            emps = alasql('SELECT * FROM emp WHERE number LIKE ?', ['%' + q1 + '%']);
        } else if (q2) {
            emps = alasql('SELECT * FROM emp WHERE name LIKE ?', ['%' + q2 + '%']);
        } else {
            emps = alasql('SELECT * FROM emp', []);
        }

        // create employee list
        var tbody = $('#tbody-emps');
        tbody.empty("tr");
        for (var i = 0; i < emps.length; i++) {
            var emp = emps[i];
            var tr = $('<tr></tr>');
            tr.append('<td><img height=40 class="img-circle" src="img/' + emp.id + '.jpg"></td>');
            tr.append('<td><a href="emp.html?id=' + emp.id + '">' + emp.number + '</a></td>');
            tr.append('<td>' + emp.name + '</td>');
            tr.append('<td>' + DB.choice(emp.sex) + '</td>');
            tr.append('<td>' + emp.birthday + '</td>');
            tr.append('<td>' + emp.tel + '</td>');
            tr.appendTo(tbody);
            $("#searchname").val(" ");
        }
       $dataTable = jQuery('#tableDisp').dataTable( {
    stateSave: true
} );

$dataTable.fnSearchHighlighting();

    }
    else{
        generateQuery(query_pairs, st);
        $dataTable = jQuery('#tableDisp').dataTable( {
    stateSave: true
} );

$dataTable.fnSearchHighlighting();

        $("#searchname").val(" ");
        query_pairs = [];
        
    }

});


function getColumns(db, offset)
{
    var cols = {};
    for (i = 0; i < db.length; i++)
    {
        cols[db[i]] = [];
        alasql("select * from " + db[i]);
        var temp = alasql("show columns from " + db[i]);
        for (j = 0; j < temp.length - offset[i]; j++)
        {
            cols[db[i]][j] = temp[j + offset[i]]["columnid"];
        }
    }
    return cols;
}

function appendSelectDB(col_name, col_disp)
{
    for (i = 0; i < col_name.length; i++)
    {
        var a = $("<a href = \"#\"></a>");
        var column = col_name[i];
        var li = $("<li class =" + column + " disp_id = " + col_disp[i] + " id =\"table_title\"" + "style = \"color:blue\"" + "></li>");
        a.append(col_disp[i].replace("_", " ").replace("_", " ").replace("_", " "));
        li.append(a);
        li.appendTo("#table_names");
    }
}

function createTableAttr(selector)
{
    var name_disp = selector.attr("disp_id");
    var name = selector.attr("class");
    $(".d1d").parent().addClass("btn-success");
    ($(".d1d").text(name_disp.replace("_", " ").replace("_", " ").replace("_", " ")));
    $(".button1").addClass("btn-success");
    $("#table_attributes").empty("li");
    for (i = 0; i < col_disp_name[name_disp].length; i++)
    {
        var a = $("<a href = \"#\"></a>");
        if (data_id[col_disp_name[name_disp][i]] == 0 || data_id[col_disp_name[name_disp][i]] == undefined)
        {
            var li = $("<li class = \"" + cols_sql[name][i] + " ui-widget-content\" classid=" + col_disp_name[name_disp][i] + " classid=" + col_disp_name[name_disp][i] + " parent_id =" + name + " data_id = 0 id =\"table_values\"></li>");
        } else
        {
            var li = $("<li class =\"" + cols_sql[name][i] + "ui-widget-content\"  classid=" + col_disp_name[name_disp][i] + " parent_id =" + name + " data_id = 1 id =\"table_values\"></li>");
        }
        a.append((col_disp_name[name_disp][i].replace("_", " ").replace("_", " ").replace("_", " ")));
        if (data_id[col_disp_name[name_disp][i]] == 1)
        {
            var st = $("<span class=\"glyphicon glyphicon-ok-sign\"  style = \"font-size:large;color:green; width:50px;height :40px;float:right\"></span>");
            st.appendTo(a);
            li.css("background", "lightgrey")
        }
        li.append(a);
        li.appendTo("#table_attributes");
    }
    handleColumnList();
}

function handleColumnList()
{
    $(".ui-widget-content").mouseover(function () {
        handleTableItems($(this));
    });
}

function handleTableItems(selector)
{
    var html_b = "<li class=\"ui-state-default list-group-item\" id = \"table_items\" attr_id ="
            + selector.attr("class") + " parent_id=" + selector.attr("parent_id") + " classid = "
            + selector.attr("classid") + " style = \"float:left;color:green; width:320px;height :40px\">" + selector.text()
            + "<button type=\"button\" class=\"btn btn-default glyphicon glyphicon-remove-sign\" style = \"color:red;font-size:large;color:red; width:50px;height:20px;float:right;\"></button></li>";
    var this1 = selector;
//	$("#col_list").style("background-color:green")

    if (data_id[selector.attr("classid")] == 0 || data_id[selector.attr("classid")] == undefined)
    {
        $("#col_list").append(html_b);
        selector.attr("data_id", 1);
        var st = $("<span class=\"glyphicon glyphicon-ok-sign\"  style = \"font-size:large;color:green; width:50px;height :40px;float:right\"></span>");
        st.appendTo(selector.children("a"));
        selector.css("background", "lightgrey")
        data_id[selector.attr("classid")] = 1;
      
    }
    $("#col_list").children("#table_items").children("button").click(function () {
        handleRemove($(this).parent("#table_items"));
    });
}

function handleRemove(selector)
{
    $("#table_attributes").children("#table_values").each(function (index) {
        if ($(this).attr("classid") == selector.attr("classid"))
        {
           
            $(this).children("a").children("span").remove();
            $(this).css("background", "white")
        }
    });
    selector.attr("data_id", 0);
    data_id[selector.attr("classid")] = 0;
    
    selector.remove();
}

function generateQuery(query_pairs, st)
{
    $("#search2").show();
    $("#search1").hide();
    query_table = query_pairs[0];
    query_cols = query_pairs[1];
    query_disp = query_pairs[2];  
    st = formulateQuery(st);
    formTable(st);
    chooseCols();
}

function formQueryPairs()
{
    var cnt = 0;var query_join=[];
    $("#col_list").children("#table_items").each(function (index) {
        query_table[cnt] = $(this).attr("parent_id");
        query_cols[cnt] = $(this).attr("attr_id");
        query_disp[cnt + 2] = $(this).attr("classid");
        query_join[cnt] = query_table[cnt] +"_"+query_cols[cnt];
        cnt++;
    });
    if(query_table.toString().includes("family") && !query_join.toString().includes("family_name"))
    {
  
       query_table[cnt] = "family";
       query_cols[cnt] = "name";
       query_join[cnt] = query_table[cnt] +"_"+query_cols[cnt];
       query_disp[cnt + 2] = "MEMBER_NAME";
       cnt++;
    }
    if(query_table.toString().includes("addr") && !query_join.toString().includes("addr_zip"))
    {
       query_table[cnt] = "addr";
       query_cols[cnt] = "zip";
       query_join[cnt] = query_table[cnt] +"_"+query_cols[cnt];
       query_disp[cnt + 2] = "ZIP_CODE";
       cnt++;
    }
    cnt=0;
    var query_disp1 = ["EMPLOYEE ID", "EMPLOYEE NUMBER"];
    var query_table1=[];
    var query_cols1=[];
    for(i=0;i<db.length;i++)
    {
        for(j=0;j<cols_sql[db[i]].length;j++)
        {
            if(query_join.indexOf(db[i]+"_"+cols_sql[db[i]][j]) != -1)
            {
                query_table1[cnt] = db[i];
                query_cols1[cnt] = cols_sql[db[i]][j];
                query_disp1[cnt+2] = query_disp[query_join.indexOf(query_table1[cnt]+"_"+query_cols1[cnt])+2];
                cnt++;
            }
        }
    }
    
    query_disp=[];query_table=[];query_cols=[];
    query_disp = query_disp1;
    query_table = query_table1;
    query_cols = query_cols1;
    query_pairs.push(query_table1);
    query_pairs.push(query_cols1);
    query_pairs.push(query_disp1);
    return query_pairs;
}

function formulateQuery(st)
{
    var uniq_tab = Array.from(new Set(query_table));
    var cnt = 0;
    //for(i=0;i<uniq_tab.length;i++)
    for (i = 0; i < query_table.length; i++)
    {
        cnt = cnt + 1;
        if (cnt == query_table.length)
            st = st + query_table[i] + "." + query_cols[i] + " as " + query_table[i] + "_" + query_cols[i] + " from emp";
        else
            st = st + query_table[i] + "." + query_cols[i] + " as " + query_table[i] + "_" + query_cols[i] + ", ";
    }
   
    if (uniq_tab.length == 1)
    {
        if (uniq_tab[0] != "emp")
        {
            st = st + " outer join " + uniq_tab[0] + " on emp.id =" + uniq_tab[0] + ".emp";
        }
    } else
    {
        for (i = 0; i < uniq_tab.length; i++)
        {
            if (uniq_tab[i] == "emp")
            {

            } else
            {
                st = st + " outer join " + uniq_tab[i] + " on " + uniq_tab[i] + ".emp = " + "emp" + ".id";
            }
        }
    }
    processresult(st);
    return st;
}

function formTable(st)
{
    var tbody = $('#tbody-emps');
    var thead = $('#thead-emps');
    thead.empty("tr");
    tbody.empty("tr");
    emps = processresult(st);
    //thead.empy("tr");
    var tr = $("<tr></tr>");
    for (i = 0; i < query_disp.length; i++)
    {
        tr.append('<th>' + query_disp[i].replace('_', " ").replace('_', " ").replace('_', " ") + '</th>');
    }
    tr.appendTo(thead);
    var prev_empid = "";
    for (i = 0; i < emps.length; i++)
    {
        var emp = emps[i];
        if (emp == undefined)
        {

        } else
        {
            var cols = Object.keys(emp);
            var tr = $('<tr></tr>');
            tr.append('<td><img height=40 class="img-circle" src="img/' + emp.id + '.jpg"></td>');
            tr.append('<td><a href="emp.html?id=' + emp.id + '">' + emp.number + '</a></td>');
            for (j = 0; j < cols.length - 2; j++)
            {
                   if(emp[cols[j + 2]] == undefined ) emp[cols[j + 2]] = "";
                   if (emp[cols[j + 2]].toString().includes("\n"))
                    {
                        var emp_arr = emp[cols[j + 2]].split("\n");
                        var td = $("<td></td>");
                        for (k = 0; k < emp_arr.length; k++)
                        {
                            if (emp_arr[k] == "" || emp_arr[k] == undefined || emp_arr[k] == "-")
                            {
                                
                                emp_arr[k] = "-";
                                td.append('<li class = \"list-group\" style ="width:150px">' + emp_arr[k].toString() + '</li>');
                            } else {
                                
                                if (choice_cols.indexOf(query_cols[j]) != -1)
                                {
                                    td.append('<li class = \"list-group\"   style ="width:150px">' + DB.choice(parseInt(emp_arr[k])).toString() + '</li>');
                                } else
                                {
                                    td.append('<li class = \"list-group\" style ="width:150px">' + (emp_arr[k]).toString() + '</li>');
                                }
                            }
                        }
                        td.appendTo(tr);
                        tr.appendTo(tbody);
                    }
                    else 
                    {
                        if (emp[cols[j + 2]] == "" || emp[cols[j + 2]] == undefined || emp[cols[j + 2]] == "-")
                        {
                            emp[cols[j + 2]] = "-";
                            tr.append('<td>' + JSON.stringify(emp[cols[j + 2]]).replace("\"", "").replace("\"", "") + '</td>');
                        } else
                        {
                            if (choice_cols.indexOf(query_cols[j]) != -1)
                            {
                                
                                tr.append('<td>' + JSON.stringify(DB.choice(emp[cols[j + 2]])).replace("\"", "").replace("\"", "") + '</td>');
                            } else
                            {
                                tr.append('<td>' + JSON.stringify(emp[cols[j + 2]]).replace("\"", "").replace("\"", "") + '</td>');
                            }
                           
                        }
                         tr.appendTo(tbody);
                    }
                
                
            }
        }
    }
    }

function createNewTable()
{
    $("#col_list").children("#table_items").remove();
    $("#table_attributes").children("#table_values").remove();
    data_id = [];
    $(".button1").children(".d1d").parent().removeClass("btn-success");
    $(".button1").children(".d1d").text("Choose the type of database");
    $(".button2").children(".d1d").parent().removeClass("btn-success");
    $(".button2").children(".d1d").text("Choose which information you require   ");
    $("#crtd_table").siblings(".button3").children(".d2d").text("choose the table you wanted to delete");
    $("#svd_table").siblings(".button5").children(".d6d").text("choose the table you wanted to open");
    $("#tab_name").val("");
    tab_open_name ="";
}

function saveTable()
{
    $("#save").click(function ()
    {
        query_table = [];
        query_cols = [];
        query_disp = ["EMPLOYEE ID", "EMPLOYEE NUMBER"];
        query_pairs = formQueryPairs();
        if (query_table.length != 0)
        {
            var colstr = query_cols.join(",");
            var tabstr = query_table.join(",");
            var dispstr = query_disp.join(",");
            var sv_name = addTableSetRecords(colstr, tabstr, dispstr);
           
            if(sv_name[1] == 0)
            {
            var st = "\"" + sv_name[0] + "\" saved!!";
            //$("#tab_name").attr("placeholder", st)
            toastr.success(st);
            $(".d6d").text(sv_name[0]);
            tab_open_name = sv_name[0];
            }
        }
        else
        {
            toastr.error("There is nothing to save");
        }
        addTables($("#crtd_table"));
        addTables($("#disp_table"));
        addTables($("#svd_table"));
        viewTable();
        openTable();
    });
}

function addTableSetRecords(colstring, tabstring, dispstring)
{
    var id = alasql('SELECT MAX(id) + 1 as id FROM tableset')[0].id;
   
    if (id == undefined)
        id = 1;
    var name = [];
    name[0] = $("#tab_name").val();
    if(tab_open_name !="")
    {
        alasql("delete from tableset where name =\""+tab_open_name.split("_").join(" ")+"\"");
    }
    if (name[0] == "")
        name[0] = "unnamed" + id;   
    var tables = alasql("select name from tableset");
    var table_names = [];
    for(i=0;i<tables.length;i++)
    {
        table_names[i] = tables[i]["name"];
    }
   
    
    if(table_names.indexOf(name[0])!= -1)
    {
        toastr.error("Table already exists!");
        name[1] = 1;
    }
    else
    {
    var nt = "INSERT INTO tableset(id,name,tablestring,columnstring,displaystring) VALUES (\"" + parseInt(id) + "\",\"" + name[0] + "\",\"" + tabstring + "\",\"" + colstring + "\",\"" + dispstring + "\");";
    alasql(nt);
    name[1]=0;
    }
    
    return name;
}

function deleteTable()
{
    $("#crtd_table").children("#table_crt").click(function ()
    {
        tab_del_name = $(this).attr("class");
        $(".d2d").text(tab_del_name.split("_").join(" "));
        
    });
}

function getTableSetData()
{
    var tabs = alasql("SELECT * from tableset");
    tableset["name"] = [];
    tableset["id"] = [];
    tableset["columnstring"] = [];
    tableset["tablestring"] = [];
    for (i = 0; i < tabs.length; i++)
    {
        tableset["id"].push(tabs[i]["id"]);
        tableset["name"].push(tabs[i]["name"]);
        tableset["tablestring"].push(tabs[i]["tablestring"]);
        tableset["columnstring"].push(tabs[i]["columnstring"]);
    }
    return tableset;
}

function addTables(drop)
{
    drop.empty("li");
    var tabs = alasql("SELECT * from tableset");
    var name = [];
    for (i = 0; i < tabs.length; i++) {
        var a = $("<a href = \"#\"></a>");
        var li = $("<li class =" + tabs[i]["name"].split(" ").join('_') + " id =\"table_crt\"" + "style = \"color:blue\"" + "></li>");
        a.append("<span class=\"glyphicon glyphicon-file\" style=\"margin-right:20px\"></span>" + tabs[i]["name"]);
        li.append(a);
        li.appendTo(drop);
    }
}

function viewTable()
{
    $("#disp_table").children("#table_crt").click(function (index) {
        tab_crt_name = $(this).attr("class");
        $(".d3d").text(tab_crt_name.split("_").join(" "));
        query_table = [];
        query_cols = [];
        var emps = (alasql("select * FROM tableset WHERE name = \"" + tab_crt_name.split("_").join(" ") + "\";"));
       
        query_table = emps[0]["tablestring"].split(",")
        query_cols = emps[0]["columnstring"].split(",");
        query_disp = emps[0]["displaystring"].split(",");
        generateTable();
        $(".d4d").text("Preconfigured tables");
        $("#searchname").val(" ");
         $("#search1").hide();
        $("#search2").show();
        chooseCols();
    });
}

function generateTable()
{
    var st = "select emp.number, emp.id, ";
    st = formulateQuery(st);

    formTable(st);
    $dataTable = jQuery('#tableDisp').dataTable({
        stateSave: true
    });

    $dataTable.fnSearchHighlighting();

   
    chooseCols();
    //$("#view").append("<span class = \"label label-success\" id =\"text\">File created Successfully!<\span>")
}

function configureTables()
{
    var conf = $("#conf_table");
    var tables = alasql("select * from preset");
    for (i = 0; i < tables.length; i++)
    {
        var li = $("<li class = " + tables[i]["name"].split(" ").join("_") + " id=\"table_conf\" style=\"color:blue\"></li>");
        var a = $("<a href = \"#\"></a>");
        a.append("<span class=\"glyphicon glyphicon-file\" style=\"margin-right:20px\"></span>" + tables[i]["name"]);
        li.append(a);
        li.appendTo(conf);
    }
}

function chooseTable()
{
    $("#conf_table").children("#table_conf").click(function (index)
    {
        tname = $(this).attr("class");
        $(".d4d").text(tname.split("_").join(" "));

        query_table = [];
        query_cols = [];
        var emps = (alasql("select * FROM preset WHERE name = \"" + tname.split("_").join(" ") + "\";"));
      
        query_table = emps[0]["tablestring"].split(",")
        query_cols = emps[0]["columnstring"].split(",");
        query_disp = emps[0]["displaystring"].split(",");
        generateTable();
        $(".d3d").text("Choose the employee list you want to display");
        $("#searchname").val(" ");
        $("#search1").hide();
        $("#search2").show();
        chooseCols();
    });
}

function dropTables(selector)
{
    a = alasql("DELETE FROM tableset WHERE name = \"" + tab_open_name.split("_").join(" ") + "\";");
    if (a == 1) {
       
        toastr.success("Table deleted successfully!");
        $("#crtd_table").children("#table_crt").remove("." + tab_open_name);
        $("#disp_table").children("#table_crt").remove("." + tab_open_name);
        $("#svd_table").children("#table_crt").remove("." + tab_open_name);
        $("#disp_table").siblings(".button4").children(".d3d").text("choose the table you wanted to delete");
        $("#crtd_table").siblings(".button3").children(".d2d").text("choose the table you wanted to delete");
        $("#svd_table").siblings(".button5").children(".d6d").text("choose the table you wanted to open");
        if(tab_open_name!="")
        {
            createNewTable();
            $("#tab_name").val("");
        }
        tab_del_name = "";
        a = 0;
    } else
    {
        toastr.error("please choose a table to delete");
    }
}

function chooseCols()
{
    var choose = $("#choosecol");
    $(".d7d").text("choose the column you want to search");
    choose.empty("li"); 
    for (i = 0; i < query_disp.length - 2; i++)
    {
        var li = $("<li class = \"" + query_table[i]+"_"+query_cols[i] + "\" id = \"selectcols\"></li>");
        var a = $("<a href = \"#\"></a>");
        a.append(query_disp[i + 2].split("_").join(" "));
        li.append(a);
        li.appendTo(choose);
    }
    $("#choosecol").children("#selectcols").click(function () {
        $("#searchname").val("");
        col_name1 = $(this).attr("class");
        $(".d7d").text($(this).children("a").text());
        $("#searchcol").click(function(){
        var st = "select emp.number, emp.id, ";
        st  = formulateQuery(st);
        
        var col = col_name1.split("_")[1];
        var data = $("#searchname").val().toString().toLowerCase();
        if(choice_cols.indexOf(col)!= -1)
        {
        for(i=1;i<=10;i++)
        {
       
            if(((DB.choice(i).toLowerCase() == data.toLowerCase()) || (DB.choice(i).toLowerCase().charAt(0) == data.toLowerCase()[0])) && col == choice_cols[Math.ceil(i/2)-1])
            {
                data = i;
                break;
            }
        }
        }
        st = "select * from ("+st+") where "+col_name1+" LIKE \"%"+data+"%\" order by emp.id";
        
        formTable(st);
        chooseCols();
        });
    });
   
 }
 
 function openTable()
 {
     $("#svd_table").children("#table_crt").click(function ()
    {
        tab_open_name = $(this).attr("class");
        $(".d6d").text(tab_open_name.split("_").join(" "));
        
        EditTable();
        
    });  
 }
 
function EditTable(sel)
{
    $(".button1").children(".d1d").parent().removeClass("btn-success");
    $(".button1").children(".d1d").text("Choose the type of database");
    $(".button2").children(".d1d").parent().removeClass("btn-success");
    $(".button2").children(".d1d").text("Choose which information you require   ");
    $("#table_attributes").children("#table_values").remove();
    var a = alasql("select * from tableset WHERE name = \"" + tab_open_name.split("_").join(" ") + "\";");
    if (a.length != 0)
    {
        data_id = [];
        $("#col_list").children("#table_items").remove();
        var tables = a[0]["tablestring"].split(",");
        var columns = a[0]["columnstring"].split(",");
        var dispcol = a[0]["displaystring"].split(",");
        for (i = 0; i < columns.length; i++)
        {
            var html_b = "<li class=\"ui-state-default list-group-item\" id = \"table_items\" attr_id ="
                    + columns[i] + " parent_id=" + tables[i] + " classid = "
                    + dispcol[i + 2] + " style = \"float:left;color:green;width:320px;height :40px\">" 
                    + dispcol[i + 2].split("_").join(" ") 
                    +"<button type=\"button\" class=\"btn btn-default glyphicon glyphicon-remove-sign\" style = \"color:red;font-size:large;color:red; width:50px;height:20px;float:right;\"></button></li>";
            if (data_id[dispcol[i+2]] == 0 || data_id[dispcol[i+2]] == undefined)
            {
                $("#col_list").append(html_b);
                var st = $("<span class=\"glyphicon glyphicon-ok-sign\"  style = \"font-size:large;color:green; width:50px;height :40px;float:right\"></span>");
                //st.appendTo(selector.children("a"));
                //selector.css("background", "lightgrey")
                data_id[dispcol[i+2]] = 1;
              
            }
            $("#col_list").children("#table_items").click(function () {
                handleRemove($(this));
            });
            $("#tab_name").val(tab_open_name.split("_").join(" "));
        }
    }
}
 
function authenticate()
{ 
if(loginid == 1)
{
  $("#authent").modal("hide");
  $ ("#exampleModal").modal("show");  
}
else{
$("#Login").click(function(){
    $("#Login").siblings("span").text("");
    var uid = $("#username").val();
    var pwd = $("#password").val();
    if(uid == "Admin" && pwd == "admin")
    {
         
       $("#authent").modal("hide");
       $("#settings").attr("data-target","#exampleModal");
       $ ("#exampleModal").modal("show");
       loginid = 1;
       $(".remove").show();
       toastr.success('Administrator Logged in!');
    }
    else
    {
        $("#Login").parent(".modal-footer").append("<span id =\"error\" style = \"color:red\">Username or Password Incorrect !!<span>");
    }
});
}
}

function processresult(st)
{
    var res = alasql(st);
    var empid = [];
  
    for (index = 0; index < res.length; index++)
    {
        empid[index] = res[index]["id"];
    }
    var chooseKeys = ["family_name", "family_sex", "family_cohabit", "family_care", "family_birthday", "family_relation", "addr_zip", "addr_state", "addr_city", "addr_street", "addr_bldg", "addr_house"];
    var choices = ["family_sex", "family_cohabit", "family_care", "addr_house"];
    empid = Array.from(new Set(empid));
    var count = 0;
    var rm = [];

    var keys = Object.keys(res[0]);
    var k1 = keys;
    
    delete keys[keys.indexOf("family_name")]
    keys.push("family_name");
   
    delete keys[keys.indexOf("addr_zip")]
    keys.push("addr_zip");
    
    for (i = 0; i < empid.length; i++)
    {
        for (j = count + 1; j < res.length; j++)
        {     
             if (empid[i] == res[j]["id"])
            {
                
                for (k = 0; k < keys.length; k++)
                {
                    if (keys[k] != undefined)
                    {
                        
                        if (chooseKeys.indexOf(keys[k]) != -1)
                        {
                            if (choices.indexOf(keys[k].toString()) == -1)
                            {
                                if(res[count][keys[k]] != undefined)
                                if (!((res[count][keys[k]]).toString().includes(res[j][keys[k]].toString())) || (res[j][keys[k]].toString() == "" && ((keys[k].toString().includes("family") && res[count]["family_name"].toString().indexOf(res[j]["family_name"].toString()) == -1 ) ||(keys[k].toString().includes("addr") && res[count]["addr_zip"].toString().indexOf(res[j]["addr_zip"].toString()) == -1 ) )))
                                {
                                    res[count][keys[k]] = res[count][keys[k]] + "\n" + res[j][keys[k]];
                                }
                            } else
                            {
                                if (keys[k].toString().indexOf("family") != -1)
                                {

                                    if (!res[count]["family_name"].toString().includes(res[j]["family_name"].toString()))
                                    {

                                        res[count][keys[k]] = res[count][keys[k]] + "\n" + res[j][keys[k]];
                                    }
                                } else
                                {
                                    if (!res[count]["addr_zip"].toString().includes(res[j]["addr_zip"].toString()))
                                    {

                                        res[count][keys[k]] = res[count][keys[k]] + "\n" + res[j][keys[k]];
                                    }
                                }
                            }
                        }

                    }
                }
                rm.push(j);
            } else
            {
                count = j;
                break;
            }
        }

    }
    for (i = 0; i < rm.length; i++)
    {
        delete res[rm[i]];
    }
    return res;
}

function logout()
{
    $("#logout").click(function(){
         toastr.info('Administrator Logged out!');
         $(".remove").hide();
         loginid = 0;
         $("#settings").attr("data-target","#authent");
    });
}

