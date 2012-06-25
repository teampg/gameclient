/** @author brodydoescode */

module("Util");


test("May not be instantiated.", function () {
    var cannotBeInstantiated,
        u = Util;

    try {
        cannotBeInstantiated = new Util();      
        ok(false, "Util may not be instantiated. -- FAIL.");
    } catch (e) {
        ok(true, "Util may not be instantiated.");       
    }
});


//TODO Test searching down prototype chain.
test("isEmpty()", function () {
    var u = Util;
    
    // Object literals
    strictEqual(u.isEmpty({}), true, "{} must be empty.");
    strictEqual(u.isEmpty({"a": "b"}), false, "{'a': 'b'} must not be empty.");
    strictEqual(
        u.isEmpty({
            "a": function () {
                var a = 1;
            }
        }),
        false,
        "Object with methods are empty."
    );

    // Array literals
    strictEqual(u.isEmpty([]), true, "[] must be empty.");
    strictEqual(u.isEmpty(['a']), false, "['a'] must not be empty.");
    strictEqual(u.isEmpty([0, 1, 2, 3]), false, "[0, 1, 2, 4] must not be empty.");
});


test("hasCSSClass()", function() {
    var u = Util;
    
    var fixture = document.getElementById("qunit-fixture");
    fixture.innerHTML = "<span id='testId' class='testClass'></span>";
    
    var ele = document.getElementById("testId");
    
    strictEqual(
        u.hasCSSClass(ele, "testClass"),
        true,
        "testId must have testClass"
    );
    
    strictEqual(
        u.hasCSSClass(ele, "nonExistantClass"),
        false,
        "testId must not have nonExistantClass"
    );

});


test("add/has/removeCSSClass()", function () {
    var u = Util;
    
    var classA = "someClassA";
    var classB = "someClassB";
    
    document.getElementById("qunit-fixture")
       .innerHTML = "<span id='testId' class='" + classB + "'></span>";
    
    var ele = document.getElementById("testId");
    
    u.addCSSClass(ele, classA);
    strictEqual(u.hasCSSClass(ele, classA), true, "testId must have " + classA);
    strictEqual(u.hasCSSClass(ele, classB), true, "testId must have " + classB);
    
    u.removeCSSClass(ele, classA);
    strictEqual(u.hasCSSClass(ele, classA), false, "testId was removed.");
    strictEqual(u.hasCSSClass(ele, classB), true, "testId must have testClass");
    
    u.removeCSSClass(ele, classB);
    strictEqual(u.hasCSSClass(ele, classA), false, "testId was removed.");
    strictEqual(u.hasCSSClass(ele, classB), false, "testId was removed.");    
});


test("add/has/removeCSSClass() same class multiple times", function () {
    var u = Util;
    
    var classA = "someClassA";

    document.getElementById("qunit-fixture")
       .innerHTML = "<span id='testId' class='" + classA + "'></span>";
    
    var ele = document.getElementById("testId");
    
    // Add twice.
    u.addCSSClass(ele, classA);
    u.addCSSClass(ele, classA);
    strictEqual(u.hasCSSClass(ele, classA), true, "testId must have " + classA);
    
    // Remove twice.
    u.removeCSSClass(ele, classA);
    u.removeCSSClass(ele, classA);
    strictEqual(u.hasCSSClass(ele, classA), false, "testId was removed.");
});


test("add/has/removeCSSClass() for undefined element", function () {
    var u = Util;

    var undefinedVar = undefined;

    try {
        u.addCSSClass(undefinedVar, "someClass");
        ok(false, "addCSSClass() require non-undefined element. -- FAIL");
    } catch (e) {
        ok(true, "addCSSClass() require non-undefined element.");        
    }
    
    try {
        u.hasCSSClass(undefinedVar, "someClass");
        ok(false, "hasCSSClass() requires non-undefined element. -- FAIL");
    } catch (e) {
        ok(true, "hasCSSClass() requires non-undefined element.");        
    }
    
    try {
        u.removeCSSClass(undefinedVar, "someClass");
        ok(false, "removeCSSClass() requires non-undefined element. -- FAIL");
    } catch (e) {
        ok(true, "removeCSSClass() requires non-undefined element.");
    }
});


test("add/has/removeCSSClass() for undefined class", function () {
    var u = Util;
    
    var undefinedClass;

    document.getElementById("qunit-fixture")
       .innerHTML = "<span id='testId'></span>";
    
    var ele = document.getElementById("testId");
    
    // undefined
    try {
        u.addCSSClass(ele, undefinedClass);
        ok(false, "Cannot add undefined to CSS className. -- FAIL");
    } catch (e) {
        ok(true, "Cannnot add undefined to CSS className.");
    }

    // Object type
    try {
        u.addCSSClass(ele, {});
        ok(false, "Cannot add Object type to CSS className. -- FAIL");
    } catch (e) {
        ok(true, "Cannot add Object type to CSS className.");
    }

    // Array type
    try {
        u.addCSSClass(ele, []); // Adds [object Object] to className    
        ok(false, "Cannot add Array type to CSS className. -- FAIL");
    } catch (e) {
        ok(true, "Cannot add Array type to CSS className.");
    }

    // Number type
    try {
        u.addCSSClass(ele, 1);  // Adds a number type, not a string "1"
        ok(false, "Cannot add Number type to CSS className. -- FAIL");
    } catch (e) {
        ok(true, "Cannot add Number type to CSS className.");
    }
});