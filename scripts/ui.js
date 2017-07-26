var fonts = ["Iceland", "Iceberg", "Anonymous Pro",
            "VT323", "Offside", "Combo"];

var red = "#e74c3c";
var green = "#2ecc71";

// Interval variable for timer update
var updateTimer;

// Just stopped prevents timer only being stopped while space is pressed
var justStopped = false;

// heldDown requires space bar held for 0.55 seconds (stackmat reg)
var heldDown = false;
// heldDownTimeout is Timeout variable for 0.55 seconds
var heldDownTimeout;

// bool indicating whether currently in inspection
var inspectionTime = false;
// Interval of inspection time countdown
var inspectionInterval;

// Defined as function to rebind event handlers and avoid
// Rapid re-calling of event function when key is held down
function onkeydownFunction(e) { 
    
    this.onkeydown = null; 
    
    // If it's not the space bar or timer is disabled, carry on
    if (e.keyCode != 32 || Settings.timerDisabled) { return true; }
    
    // If the timer is running, stop it
    if (cubeTimer.isRunning) { stopCubeTimer(); heldDown = false; }
    
    else {
        timerElement.style.color = red;
        // Begin timeout for 0.55 seconds
        heldDownTimeout = setTimeout(function() {
            heldDown = true;
            timerElement.style.color = green;
        }, Settings.holdDelay);
    }
}

// Bind event to start (unbinds and rebinds as necessary)
document.onkeydown = onkeydownFunction;

// onkeyup event to start timer/inspection
document.onkeyup = function(e) {
    
    // Rebind onkeydown event - works for all events, not just space
    this.onkeydown = onkeydownFunction;
    
    // If it's not the space bar or timer is disabled, carry on
    if (e.keyCode != 32 || Settings.timerDisabled) { return true; }
    
    // Remove red or green coloring
    timerElement.style.color = "#444444";
    
    // Clear heldDownTimeout - key is released, timeout restarts
    clearTimeout(heldDownTimeout);
    heldDownTimeout = undefined;
    
    // If it's not running and it's not just stopped AND heldDown==true
    if (!cubeTimer.isRunning && !justStopped && heldDown) {

        heldDown = false;
        
        // Should we include inspection time?
        if (Settings.inspectionTime) {
            
            // If inspection has already started, start solve itself
            if (inspectionTime == true) {
                
                inspectionTime = false;
                clearInterval(inspectionInterval);
                startCubeTimer();
            }
            
            else {
                // Start inspection time
                inspectionTime = true;
                
                // Inspection time (settings variable)
                var timeLeft = Settings.inspectionTimeLength; 
                timerElement.innerHTML = timeLeft;

                // Subtract one each second 
                inspectionInterval = setInterval(function() {
                    
                    timeLeft--;
                    
                    timerElement.innerHTML = timeLeft;

                    // If we're all done, start the solve
                    if (timeLeft == 0) { 
                        clearInterval(inspectionInterval);
                        startCubeTimer();
                    }
                }, 1000)
            } 
        }
        
        // If there's no inspection time to deal with, start solve
        else {
            startCubeTimer();
        }
    }
    
    // If justStopped was true (prevent solve/inspection from starting),
    // set it to false so it works next time around.
    else { justStopped = false; }
}

function startCubeTimer() {
    
    // Start timer object
    cubeTimer.start();
    
    // Begin updating timer on screen
    updateTimer = setInterval( function () {
        
        // Display formatted .currentTime() in timerElement
        timerElement.innerHTML = formatTime(cubeTimer.currentTime());    
        
    }, 1);
}

function stopCubeTimer() {
    
    // Stop timer object
    cubeTimer.stop();
    
    // Stop updating timer element, then update it one last time
    clearInterval(updateTimer);
    timerElement.innerHTML = formatTime(cubeTimer.currentTime())
    
    
    // Prevent timer from restarting immediately after stopping
    justStopped = true;
    
    addTime(cubeTimer.currentTime());
}



// Define displayInfo function that displays #timeInfo modal
function displayInfo(timeObject) {
    
    // Define variables for various elements
    var formattedTimeElement = document.getElementById("timeInfoValue");
    var millisecondsElement = document.getElementById("timeInfoMilliseconds");
    var scrambleElement = document.getElementById("timeInfoScramble");
    
    // Reset color in case previous time was blue
    formattedTimeElement.style.color = "#444444";
    
    // Set innerHTML for each one with accurate info
    formattedTimeElement.innerHTML = timeObject.formattedTime;
    millisecondsElement.innerHTML = timeObject.time + " milliseconds";
    scrambleElement.innerHTML = timeObject.scramble;
    
    // Special case if solve is a +2
    if ( timeObject.plusTwo ) {
        
        formattedTimeElement.innerHTML += "+";
        millisecondsElement.innerHTML += " (originally " + (timeObject.time - 2000) + " milliseconds)";
        
        formattedTimeElement.style.color = "#9b59b6";
        
    }
    
    // Display modal with flex to allow vertical centering
    document.getElementById("timeInfoWrapper").style.display = "flex";
    
    Settings.timerDisabled = true;
    
}



// Make settings and info icons blue on hover
var settingsIcon = document.getElementById("settingsIcon");
var infoIcon = document.getElementById("infoIcon");

settingsIcon.onmouseenter = function() {
    this.src = "images/settings_blue.png";
}
settingsIcon.onmouseleave = function() {
    this.src = "images/settings_gray.png";
}
infoIcon.onmouseenter = function() {
    this.src = "images/info_blue.png";
}
infoIcon.onmouseleave = function() {
    this.src = "images/info_gray.png";
}

// One global variable for settings change
var digitsChanged = false;


settingsIcon.onclick = function() {
    // Setting var to false, track changes in digit display preferences
    digitsChanged = false;
    
    // Display modal (flex for vertical alignment)
    document.getElementById("settingsWrapper").style.display = "flex";
    
    // Disable timer
    Settings.timerDisabled = true;
    
    // Define HTML variables
    var inspectionBool = document.getElementById("inspectionTimeInput");
    var inspectionInt = document.getElementById("inspectionSeconds");
    
    var holdDelayBool = document.getElementById("holdDelayInput");
    var holdDelayInt = document.getElementById("holdDelaySeconds");
    
    var twoDigits = document.getElementById("digits2");
    var threeDigits = document.getElementById("digits3");
    
    // Inspection time
    inspectionBool.checked = Settings.inspectionTime;
    
    // Disable number input if inspection is turned off
    inspectionInt.disabled = !inspectionBool.checked;
    
    // Update state of number input when value is changed
    inspectionBool.onchange = function() {
        inspectionInt.disabled = !this.checked;
    }
    
    // Hold delay
    holdDelayBool.checked = (Settings.holdDelay != 0);
    
    // Disable number input if hold delay is turned off
    holdDelayInt.disabled = !holdDelayBool.checked;
    
    // Update state of number input when value is changed
    holdDelayBool.onchange = function() {
        holdDelayInt.disabled = !holdDelayBool.checked;
    }
    
    var digits = document.getElementById("digitsButtonsWrapper").children;
    var which = Settings.decimalPlaces - 2;
    
    digits[which].className = "digit selected";
    digits[(which+1)%2].className = "digit";
    
}

document.getElementById("digits2").onclick = function() {
    Settings.decimalPlaces = 2;
    this.className = "digit selected";
    this.parentElement.children[1].className = "digit";
    digitsChanged = true;
}
document.getElementById("digits3").onclick = function() {
    Settings.decimalPlaces = 3;
    this.className = "digit selected";
    this.parentElement.children[0].className = "digit";
    digitsChanged = true;
}

document.getElementById("settingsSave").onclick = function() {
    
    // Checking inspection time
    var iti = document.getElementById("inspectionTimeInput");
    Settings.inspectionTime = iti.checked;
    
    var toTest = parseInt(document.getElementById("inspectionSeconds").value);
    
    // If it's NaN, set it to 0
    toTest = (isNaN(toTest)) ? 0 : toTest;
    
    // If outside scope 0-59, set it to 0 or 59
    toTest = (toTest > 59) ? 59 : toTest;
    toTest = (toTest < 0) ? 0 : toTest;
    
    Settings.inspectionTimeLength = toTest;
    
    
    // Checking hold delay 
    var hdi = document.getElementById("holdDelayInput");
    if (!hdi.checked) { Settings.holdDelay = 0; }
    else {
        var toTest2 = document.getElementById("holdDelaySeconds").value;
        toTest2 = parseFloat(toTest2);
        
        // If it's NaN, set it to 0
        toTest2 = (isNaN(toTest2)) ? 0 : toTest2;
        
        // If outside scope 0-2, set it to 0 or 2
        toTest2 = (toTest2 > 2) ? 2 : toTest2;
        toTest2 = (toTest2 < 0) ? 0 : toTest2;
        
        Settings.holdDelay = toTest2*1000;
    }
    
    if (digitsChanged) {
        
        updateAverageDisplays();
        
        timerElement.innerHTML = formatTime(0);
        
        // Update time label of each time listed
        for (var i = 0; i < currentEvent.times.length; i++) {
            
            // Get time object
            var timeObject = currentEvent.times[i];
            
            var timeLabel = timeObject.element.children[1];
            timeLabel.innerHTML = formatTime(timeObject.time);
            
        } 
    }
    
    document.getElementById("settingsWrapper").style.display = "none";
    Settings.timerDisabled = false;
}



infoIcon.onclick = function() {
    document.getElementById("infoWrapper").style.display = "flex";
    Settings.timerDisabled = true;
}

var it1 = document.getElementById("howTo");
var it2 = document.getElementById("aboutMe");
var it3 = document.getElementById("versionNotes");


// On click functions
document.getElementById("info1").onclick = function() {
    
    // Set class to active, set classes of others to blank
    var c = this.parentElement.children;
    
    for (var i = 0; i < c.length; i++) {
        c[i].className = "";
    }
    this.className = "active";
    
    var toHide = document.getElementsByClassName("infoContent");
    
    for (var i = 0; i < toHide.length; i++) {
        toHide[i].style.display = "none";
    }
    
    document.getElementById("howTo").style.display = "block";
}

document.getElementById("info2").onclick = function() {
    
    // Set class to active, set classes of others to blank
    var c = this.parentElement.children;
    
    for (var i = 0; i < c.length; i++) {
        c[i].className = "";
    }
    this.className = "active";
    
    var toHide = document.getElementsByClassName("infoContent");
    
    for (var i = 0; i < toHide.length; i++) {
        toHide[i].style.display = "none";
    }
    
    document.getElementById("aboutMe").style.display = "block";
}

document.getElementById("info3").onclick = function() {
    
    // Set class to active, set classes of others to blank
    var c = this.parentElement.children;
    
    for (var i = 0; i < c.length; i++) {
        c[i].className = "";
    }
    this.className = "active";
    
    var toHide = document.getElementsByClassName("infoContent");
    
    for (var i = 0; i < toHide.length; i++) {
        toHide[i].style.display = "none";
    }
    
    document.getElementById("versionNotes").style.display = "block";
}



// Define all modal close buttons on webpage
var modalCloseButtons = document.getElementsByClassName("closeModal");

// For each one, define onclick function
for (var i = 0; i < modalCloseButtons.length; i++) {
    
    modalCloseButtons[i].onclick = function() {
        
        // Get modal that is direct parent of this close button
        var modalWrapper = this.parentElement.parentElement;
        
        // Set style display to none
        modalWrapper.style.display = "none";
        
        // Reenable timer
        Settings.timerDisabled = false;
    }
}