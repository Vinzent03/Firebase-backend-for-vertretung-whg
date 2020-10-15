module.exports.checker = function checker(schoolClass, listToday, subjects, subjectsNot, personalSubstitute) {
  //filter the given schoolClass
  var listWithoutClasses = [];
  var b = 0;
  schoolClass = schoolClass.toLowerCase();
  listToday = listToday.split("||");
  listToday.forEach(part => {
    var stk = part.toLowerCase();
    if (stk.includes("std.")) {
      if (b === 1) {
        listWithoutClasses.push(part);
      }
    } else {
      if (stk.includes(schoolClass)) {
        b = 1;
      } else {
        b = 2;
      }
    }
  });

  if (personalSubstitute) {
    return betterformatting(checkerFaecher(listWithoutClasses, subjects, subjectsNot));
  } else {
    return betterformatting(listWithoutClasses);
  }
}
function betterformatting(list) {
  var betterList = [];
  list.forEach(st => {
    if (st.includes("bei +")) {
      var beginn = st.substring(0, st.indexOf("bei +") - 1);
      var end = st.substring(st.indexOf("bei +") + 6);
      st = beginn + " Entfall " + end;
    }
    betterList.push(st);
  })
  return betterList
}

function checkerFaecher(listWithoutClasses, faecherList, faecherNotList) {

  var listWithoutLessons = [];
  if (faecherList.length === 0 || (faecherList[0] === "")) {// Wenn man bei der Eingabe alles weg macht
    faecherList = [""];
  }
  if (faecherNotList.length === 0 || (faecherNotList[0] === "")) {
    faecherNotList = ["lsjdf"];
  }

  if (listWithoutClasses.length > 0) {
    listWithoutClasses.forEach(st => {
      var stLower = st.toLowerCase();
      faecherList.forEach(fach => {
        fach = fach.toLowerCase();
        if (fach !== "")
          fach = " " + fach + " ";
        var i = 0;
        faecherNotList.forEach(fachNot => {
          fachNot = fachNot.toLowerCase();
          fachNot = " " + fachNot + " ";

          if (stLower.includes("bei")) {
            stLower = stLower.substring(0, stLower.indexOf("bei"));
          }
          if (stLower.includes(fach)) {
            if (i !== 2) {
              i = 1;
            }
            if (stLower.includes(fachNot)) {
              i = 2;
            }
          }
        })
        if (i === 1) {
          listWithoutLessons.push(st);
        }
      })
    })
  }
  return listWithoutLessons;
}