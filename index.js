let userId = document.cookie.match(/c_user=(\d+)/)[1];
let fb_dtsg;

let albums = [];
let albumDownload = [];

let cardProfile = document.createElement('section');
document.querySelector('body').appendChild(cardProfile);

let req = ["education", "places", "contact_basic"];

function getInfoOther(idView, req) {
  let params = `dom_section_id=u_fetchstream_40_0&profile_id=${idView}&section=${req}&viewer_id=${userId}&lst=${userId}%3A${idView}%3A1590823298&__user=${userId}&__a=1&__csr=&__req=1q&__beoa=0&__comet_req=0&fb_dtsg=${fb_dtsg}`;
  let url = `https://www.facebook.com/profile/async/infopage/nav/`;
  var http = new XMLHttpRequest();
  http.open("POST", url, true);
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  return new Promise((resovle) => {
    http.onreadystatechange = function () {
      if (http.readyState == 4 && http.status == 200) {
        let htmlT = this.responseText.match(/__html":(.*)(?=}]],"jsmods")/g)[0];
        htmlT = htmlT.slice(8);
        resovle(htmlT);
      }
    };
    http.send(params);
  });
}

function createProfileOther(html) {
  let span2 = document.createElement("span");
  document.querySelector("body > span").appendChild(span2);
  document.querySelector("body > span > span").innerHTML = html;
}

// get fb_dtsg_ag
function quickSelect(s) {
  var method = false;
  switch (s) {
    case /#\w+$/.test(s):
      method = "getElementById";
      break;
    case /\.\w+$/.test(s):
      method = "getElementsByClassName";
      break;
  }
  return method;
}
function qSA(s) {
  return document[quickSelect(s) || "querySelectorAll"](s);
}
function getFbDtsg() {
  return new Promise((resovle) => {
    var s = qSA("script");
    for (var i = 0; i < s.length; i++) {
      if (s[i].textContent.indexOf("DTSGInitialData") > 0) {
        s = s[i].textContent;
        break;
      }
    }
    fb_dtsg = s.slice(s.indexOf('token'));
    fb_dtsg = fb_dtsg.slice((fb_dtsg.indexOf('token')+8), fb_dtsg.indexOf('}'));
    fb_dtsg = fb_dtsg.slice(0, fb_dtsg.indexOf('"'));
    fb_dtsg = encodeURIComponent(fb_dtsg);
    
    let dtsg = s.slice(s.indexOf("DTSGInitialData"));
    dtsg = dtsg.slice(0, dtsg.indexOf("}")).split('"');
    dtsg_ag = s.slice(s.indexOf("async_get_token"));
    dtsg_ag = dtsg_ag.slice(0, dtsg_ag.indexOf("}")).split('"');
    dtsg_ag = dtsg_ag[2];
    resovle(dtsg_ag);
  });
}
//get page_let_token
function getPageletToken(idView, userId, dtsg_ag) {
  let url = `https://www.facebook.com/${idView}/photos?lst=${userId}%3A${idView}%3A1590918619&fb_dtsg_ag=${dtsg_ag}&__user=${userId}&__a=1&&__csr=&__req=fetchstream_12&__beoa=0&__pc=PHASED%3ADEFAULT&dpr=1.5&__ccg=GOOD&__comet_req=0`;
  var http = new XMLHttpRequest();
  http.open("GET", url, true);
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  return new Promise((resovle) => {
    http.onreadystatechange = function () {
      if (http.readyState == 4 && http.status == 200) {
        let pageletToken = this.responseText.match(
          /pagelet_token:"(.*)(?=",lst:)/g
        );
        let pagelet_token = pageletToken[0].slice(15);
        resovle(pagelet_token);
      }
    };
    http.send();
  });
}

//get idUser
function getIdUser(username, userId, dtsg_ag, nameUser) {
  let url = `https://www.facebook.com/${username}/photos?lst=${userId}%3A${username}%3A1590918619&fb_dtsg_ag=${dtsg_ag}&__user=${userId}&__a=1&&__csr=&__req=fetchstream_12&__beoa=0&__pc=PHASED%3ADEFAULT&dpr=1.5&__ccg=GOOD&__comet_req=0`;
  var http = new XMLHttpRequest();
  http.open("GET", url, true);
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  let formId = new Promise((resovle) => {
    http.onreadystatechange = function () {
      if (http.readyState == 4 && http.status == 200) {
        let idUser = this.responseText.match(
          /profile_id(.*)(?=,tab_key)/g
        );
        idUser = idUser[0].slice(11);
        resovle(idUser);
      }
    };
    http.send();
  })
    .then(res => {
      getAllData(res, userId, nameUser);
    });
}

//get photos
function getPhotos(dtsg_ag, pageletToken, idView, userId) {
  let url = `https://www.facebook.com/ajax/pagelet/generic.php/AllPhotosAppCollectionPagelet?fb_dtsg_ag=${dtsg_ag}&data=%7B%22collection_token%22%3A%22${idView}%3A2305272732%3A5%22%2C%22cursor%22%3Anull%2C%22disablepager%22%3Afalse%2C%22overview%22%3Afalse%2C%22profile_id%22%3A%22${idView}%22%2C%22pagelet_token%22%3A%22${pageletToken}%22%2C%22tab_key%22%3A%22photos%22%2C%22lst%22%3A%22${userId}%3A${idView}%3A1590931787%22%2C%22order%22%3Anull%2C%22sk%22%3A%22photos%22%2C%22importer_state%22%3Anull%7D&__user=${userId}&__a=1&__csr=&__req=na&__beoa=0&__pc=PHASED%3ADEFAULT&dpr=1.5&__ccg=GOOD&__comet_req=0`;
  var http = new XMLHttpRequest();
  http.open("GET", url, true);
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  return new Promise((resolve) => {
    http.onreadystatechange = function () {
      if (http.readyState == 4 && http.status == 200) {
        let ul_photo = this.responseText.match(/"payload":(.*)(?=,"jsmods")/g)[0];
        ul_photo = ul_photo.slice(10);
        ul_photo = JSON.parse(ul_photo);
        let src = [];
        document.querySelector("body > section").style.display = "none";
        document.querySelector("body > section").innerHTML = ul_photo;
        let li = document.getElementsByClassName("fbPhotoStarGridElement");
        for (let i = 0; i < li.length; i++) {
          let dataSet = li[i].dataset;
          src.push(dataSet.starredSrc);
          albums.push(dataSet.starredSrc);
        }
        let formAlbum = `<ul id="album_other">`;
        for (let key in src) {
          let li = `<li><img src="${src[key]}"></li>`;
          formAlbum += li;
        }
        formAlbum += `</ul>`;
        resolve(formAlbum);
      }
    };
    http.send();
  });
}

//see more photos
let count = -1;

async function getAllData(idView, userId, nameUser) {
  try {
    let html = `<div id="overview_user_pdc">
                        <div class="img">
                            <img src="https://graph.facebook.com/${idView}/picture?type=large&width=720&height=720">
                        </div>
                        <span><b>${nameUser}</b></span>
                        <span><b>ID: ${idView}</b></span>
                    </div>`;
    let form1 = await getInfoOther(idView, req[0]);
    html += JSON.parse(form1);
    let form2 = await getInfoOther(idView, req[1]);
    html += JSON.parse(form2);
    let form3 = await getInfoOther(idView, req[2]);
    html += JSON.parse(form3);
    let dtsg_ag = await getFbDtsg();
    dtsg_ag = encodeURIComponent(dtsg_ag);
    let pageletToken = await getPageletToken(idView, userId, dtsg_ag);
    pageletToken = encodeURIComponent(pageletToken);
    html += `<div id="form_download">
      <span id="download1" class="">Tải ảnh</span>
      <span id="download2">Tải xuống tất cả</span>
      <a href="" id="formDownload" style="display:none" download=""></a>
    </div>`
    let formAlbum1 = await getPhotos(dtsg_ag, pageletToken, idView, userId);
    html += formAlbum1;
    html += `<span id="see_more_pdc">Xem thêm</span>`;
    document.querySelector('body > span > label').removeChild(document.querySelector('body > span > label > span'));
    createProfileOther(html);
    let section = document.querySelector('body > section');
    while(section.firstChild) {
        section.removeChild(section.firstChild);
    };

    //download all function
      document.getElementById('download2').addEventListener('click', function() {
        for(let key in albums) {
          setTimeout(() => {
            let url = albums[key];
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "blob";
            xhr.onload = function(){
                var urlCreator = window.URL || window.webkitURL;
                var imageUrl = urlCreator.createObjectURL(this.response);
                var tag = document.createElement('a');
                tag.href = imageUrl;
                tag.download = `anh${imageUrl}.jpg`;
                document.body.appendChild(tag);
                tag.click();
                document.body.removeChild(tag);
            }
            xhr.send();
          }, 100);
        }
      });

    //choose download each image
    async function chooseImage() {
      try {
        let liDownload = document.querySelectorAll('body > span #album_other li');
        for(let key in liDownload) {
          liDownload[key].addEventListener('click', function() {
            albumDownload = [];
            this.classList.toggle('active');
            let src = document.querySelectorAll('body > span #album_other .active img');
            for(let key in src) {
              if(albumDownload.indexOf(src[key].src) === -1) {
                albumDownload.push(src[key].src);
              }
            }
            if(albumDownload.length > 1) {
              document.querySelector('body > span #download1').classList.add('active');
            }
            if(albumDownload.length == 1) {
              document.querySelector('body > span #download1').classList.remove('active');
            }
          });
        }
      }catch(err) {}
    }
    chooseImage();

    //download each image function
      document.getElementById('download1').addEventListener('click', function() {
        if(albumDownload.length > 1) {
          for(let i = 0; i < albumDownload.length - 1; i++) {
            setTimeout(() => {
              let url = albumDownload[i];
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, true);
              xhr.responseType = "blob";
              xhr.onload = function(){
                  var urlCreator = window.URL || window.webkitURL;
                  var imageUrl = urlCreator.createObjectURL(this.response);
                  var tag = document.createElement('a');
                  tag.href = imageUrl;
                  tag.download = `anh${imageUrl}.jpg`;
                  document.body.appendChild(tag);
                  tag.click();
                  document.body.removeChild(tag);
              }
              xhr.send();
            }, 100);
          }
        }
      });

    //see more image function
        document.getElementById('see_more_pdc').addEventListener('click', function() {
          let cursor = [
              'AQHRDPdHaNwIi4RMU-JSgAQeN1eCO72vfHgf8wUPzbKyH1cx1ydcjlLU0C0gXQnA5FxuE3Mx9MRbocE2T7xH-ybStQ',
              'AQHR6RZDOeYfxMLvmQDid_9l8ZUaS_s6LPLiRmyT4IA5dLo-xs4g8NyVvs5GkqhAy1pwaPSICFKI6aYosMShBYs9IQ',
              'AQHRv5oJjc-eFMpMQ82NuJtT6XIxSEDmx5TFpZjVsgvl6JU56fp3EaA-jUtem1C8McwWvWMKAzIaHzVIuc2QhgBD1w',
              'AQHRh6cN7VpFedXDCPsCjJdt2i9AzP3_30EULFBTanwhipYKLjayp1xy5fsI9Cl0Vz399r5ZQzfHInVDHaxUbIkMkQ',
              'AQHRgw-hXHmdiZWd67F37jpzYRQzfGdcfMcG6TANdWWA9Lc3MwWDo_gyAh8kFKSuENXgWN0nAH85MQEvV7zduB25Gg',
              'AQHR-SjizGHq1Ov0M73thVFft5AlN8gE5_COWneoKjQDNUdL-OGwXflJDIyvguiKARqWJ3_9B41Z6AyKLJmKt6ii5w',
              'AQHRHLvYKRDBdMwMYyf3Wofm0MBAVTR7bETsvTJbHYxzYyppAYLo4vcyHMIqQsAPQ-yA9uv80yn50fxTa4RjNw-Mng',
              'AQHRXfhr-eB8c3vRxkr8iim6tQL_R4Z-fSEmq-Jwpy-gXmBRrgBymA9napIO_5ya0j-yGblI0mPKjLnJ-3_EzvK7KA',
              'AQHRXfhr-eB8c3vRxkr8iim6tQL_R4Z-fSEmq-Jwpy-gXmBRrgBymA9napIO_5ya0j-yGblI0mPKjLnJ-3_EzvK7KA',
              'AQHRBG4u3eUyi90-y7wy0Kx-20ZYCESdAX25W1TenuWB9bRn4JAiMwrAJOJ9S2-OUB5RWEz-otQwF53tq5UjvnRqRQ',
              'AQHR38Wf7gP6OpTKDjL_qu9Ii1tgR2FjE3kEAwxAAKy3zeohV20T0bfBxQqK0Jg_7mypharTyD8oAxj6DKcasJf0hg',
              'AQHRrkUyzVubVtSm9D7A4cpcDapUu16M6UGR57EY0H2dxk5l0luFcInq3M56DDms9inRANCm9o6R6L_IL_1feUDLJw',
              'AQHRpEyU7pu8vYZqckuoSTuBDCLFx61jRU-0lWAbQf8vh6heF3P4QVcZC5iz76zGRj3I8NkPDskejL9QcGj1dk6Qpg',
              'AQHRSW-Gh3FtPJLaE6rzGZr6IJ5xIGtP3oO6LxbR9lpdMcnU48wpMe7JKOlllAfa6ajRX2hG4XbkHFer8pgNmeOM8w',
              'AQHRGYAE5Hg0DpcD6iOm7pRxP4c6KvDPYz3tA8dFnYOUQzh14GicJlgCtfSjMV8pB4MR1H2etVfWTdyqqXIOvlxL8A'
          ]
          count++;
          let url = `https://www.facebook.com/ajax/pagelet/generic.php/AllPhotosAppCollectionPagelet?fb_dtsg_ag=${dtsg_ag}&data=%7B%22collection_token%22%3A%22${idView}%3A2305272732%3A5%22%2C%22cursor%22%3A%22${ cursor[count] }%22%2C%22disablepager%22%3Afalse%2C%22overview%22%3Afalse%2C%22profile_id%22%3A%22${idView}%22%2C%22pagelet_token%22%3A%22${pageletToken}%22%2C%22tab_key%22%3A%22photos%22%2C%22lst%22%3A%22${userId}%3A${idView}%3A1590931787%22%2C%22order%22%3Anull%2C%22sk%22%3A%22photos%22%2C%22importer_state%22%3Anull%7D&__user=${userId}&__a=1&__csr=&__req=na&__beoa=0&__pc=PHASED%3ADEFAULT&dpr=1.5&__ccg=GOOD&__comet_req=0`;
          var http = new XMLHttpRequest();
          http.open("GET", url, true);
          http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          http.onreadystatechange = function () {
              if (http.readyState == 4 && http.status == 200) {
                  let ul_photo = this.responseText.match(/"payload":(.*)(?=,"jsmods")/g)[0];
                  ul_photo = ul_photo.slice(10);
                  ul_photo = JSON.parse(ul_photo);
                  document.querySelector("body > section").innerHTML = ul_photo;
                  let li = document.getElementsByClassName("fbPhotoStarGridElement");
                  for (let i = 0; i < li.length; i++) {
                      let dataSet = li[i].dataset;
                      if(albums.indexOf(dataSet.starredSrc) === -1) {
                          albums.push(dataSet.starredSrc);
                      }
                  }
                  let formAlbum = ``;
                  for (let key in albums) {
                      let li = `<li><img src="${albums[key]}"></li>`;
                      formAlbum += li;
                  }
                  let ul = document.querySelector('body > span > span > ul');
                  while(ul.firstChild) {
                      ul.removeChild(ul.firstChild);
                  }
                  ul.innerHTML = formAlbum;
                  chooseImage();
              }
          };
          http.send();
        });
  } catch (err) {
    console.log(err);
  }
}

let homeButton = document.querySelector('.bp9cbjyn.j83agx80.cb02d2ww.l9j0dhe7');
homeButton.addEventListener("click", function () {
  let temp = new XMLHttpRequest();
  let url = `https://www.facebook.com/api/graphql`;
  temp.onreadystatechange = function () {
    if (this.status == 200) {
      tempUserName = [];
      tempId_comment = [];
    };
  }
  temp.open("GET", url, true);
  temp.send();
});

let tempUserName = [];
async function addSearchIcon() {
  try {
    let dtsg_ag = await getFbDtsg();
    dtsg_ag = encodeURIComponent(dtsg_ag);
    let searchIcon = document.querySelectorAll('.sjgh65i0.l9j0dhe7.k4urcfbm.du4w35lb');
    for(let key in searchIcon) {
      if(searchIcon[key].querySelector('.ewlkfwdl.jq4qci2q.buofh1pr.btwxx1t3.j83agx80.oo9gr5id.bp9cbjyn')) {
        let username = searchIcon[key].querySelector('.pybr56ya.dati1w0a.hv4rvrfc.n851cfcs.btwxx1t3.j83agx80.ll8tlv6m .oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.nc684nl6.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.oo9gr5id.gpro0wi8.lrazzd5p').href.match(/com(.*)(?=__cft)/g)[0];
        username = username.slice(4, username.length-1);
        if(username.indexOf('profile') !== -1){
          username = username.slice(15);
        }
        let name = searchIcon[key].querySelector('.pybr56ya.dati1w0a.hv4rvrfc.n851cfcs.btwxx1t3.j83agx80.ll8tlv6m .oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.nc684nl6.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.oo9gr5id.gpro0wi8.lrazzd5p span').textContent;
        if(tempUserName.indexOf(username) === -1) {
          tempUserName.push(username);
          if(username.indexOf('/') === -1) {
            let span = document.createElement("span");
            searchIcon[key].querySelector('.ewlkfwdl.jq4qci2q.buofh1pr.btwxx1t3.j83agx80.oo9gr5id.bp9cbjyn').appendChild(span);
            
            searchIcon[key].querySelector('.ewlkfwdl.jq4qci2q.buofh1pr.btwxx1t3.j83agx80.oo9gr5id.bp9cbjyn > span:nth-last-child(1)').addEventListener('click', function() {
            let span = document.createElement("span");
            document.querySelector("body").appendChild(span);
            let label = document.createElement("label");
            document.querySelector("body > span").appendChild(label);
            let span_label = document.createElement("span");
            document .querySelector("body > span > label").appendChild(span_label);
            document .querySelector("body > span > label") .addEventListener("click", function () {
                document.querySelector("body").removeChild(document.querySelector("body > span"));
                albums = [];
                count = -1;
            });
            getIdUser(username, userId, dtsg_ag, name);
            });
          }
        }
      }
    }
  } catch(err) {}
}

let tempId_comment = [];

async function addSearchIcon_cmt() {
  try {
    let dtsg_ag = await getFbDtsg();
    dtsg_ag = encodeURIComponent(dtsg_ag);
    let searchIcon = document.querySelectorAll('.l9j0dhe7.ecm0bbzt.hv4rvrfc.qt6c0cv9.dati1w0a.lzcic4wl.btwxx1t3.j83agx80');
    for(let key in searchIcon) {
      if(searchIcon[key].querySelector('.nc684nl6 a')) {
        let username;
        if(searchIcon[key].querySelector('.nc684nl6 a').href.indexOf('comment_id') !== -1) {
          username = searchIcon[key].querySelector('.nc684nl6 a').href.match(/com(.*)(?=comment_id)/g)[0];
        }
        else if(searchIcon[key].querySelector('.nc684nl6 a').href.indexOf('__cft') !== -1) {
          username = searchIcon[key].querySelector('.nc684nl6 a').href.match(/com(.*)(?=__cft)/g)[0];
        }
        username = username.slice(4, username.length-1);
        if(username.indexOf('profile') !== -1){
          username = username.slice(15);
        }
        let name = searchIcon[key].querySelector('.nc684nl6 a span span').textContent;
        if(tempId_comment.indexOf(username) === -1) {
          tempId_comment.push(username);
          if(username.indexOf('/') === -1) {
            let span = document.createElement("span");
            searchIcon[key].querySelector('._6coi.oygrvhab.ozuftl9m.l66bhrea.linoseic').appendChild(span);
            
            searchIcon[key].querySelector('._6coi.oygrvhab.ozuftl9m.l66bhrea.linoseic > span:nth-last-child(1)').addEventListener('click', function() {
            let span = document.createElement("span");
            document.querySelector("body").appendChild(span);
            let label = document.createElement("label");
            document.querySelector("body > span").appendChild(label);
            let span_label = document.createElement("span");
            document .querySelector("body > span > label").appendChild(span_label);
            document .querySelector("body > span > label") .addEventListener("click", function () {
                document.querySelector("body").removeChild(document.querySelector("body > span"));
                albums = [];
                count = -1;
            });
            getIdUser(username, userId, dtsg_ag, name);
            });
          }
        }
      }
    }
  } catch(err) {}
}

async function addSearchIcon_cmt2() {
  try {
    let dtsg_ag = await getFbDtsg();
    dtsg_ag = encodeURIComponent(dtsg_ag);
    let searchIcon = document.querySelectorAll('.d0szoon8.qt6c0cv9.rz4wbd8a.jb3vyjys.kvgmc6g5 .l9j0dhe7.ecm0bbzt.hv4rvrfc.qt6c0cv9.scb9dxdr.lzcic4wl.btwxx1t3.j83agx80');
    for(let key in searchIcon) {
      if(searchIcon[key].querySelector('.nc684nl6 a')) {
        let username;
        if(searchIcon[key].querySelector('.nc684nl6 a').href.indexOf('comment_id') !== -1) {
          username = searchIcon[key].querySelector('.nc684nl6 a').href.match(/com(.*)(?=comment_id)/g)[0];
        }
        else if(searchIcon[key].querySelector('.nc684nl6 a').href.indexOf('__cft') !== -1) {
          username = searchIcon[key].querySelector('.nc684nl6 a').href.match(/com(.*)(?=__cft)/g)[0];
        }
        username = username.slice(4, username.length-1);
        if(username.indexOf('profile') !== -1){
          username = username.slice(15);
        }
        let name = searchIcon[key].querySelector('.nc684nl6 a span span').textContent;
        if(tempId_comment.indexOf(username) === -1) {
          tempId_comment.push(username);
          if(username.indexOf('/') === -1) {
            let span = document.createElement("span");
            searchIcon[key].querySelector('._6coi.oygrvhab.ozuftl9m.l66bhrea.linoseic').appendChild(span);
            
            searchIcon[key].querySelector('._6coi.oygrvhab.ozuftl9m.l66bhrea.linoseic > span:nth-last-child(1)').addEventListener('click', function() {
            let span = document.createElement("span");
            document.querySelector("body").appendChild(span);
            let label = document.createElement("label");
            document.querySelector("body > span").appendChild(label);
            let span_label = document.createElement("span");
            document .querySelector("body > span > label").appendChild(span_label);
            document .querySelector("body > span > label") .addEventListener("click", function () {
                document.querySelector("body").removeChild(document.querySelector("body > span"));
                albums = [];
                count = -1;
            });
            getIdUser(username, userId, dtsg_ag, name);
            });
          }
        }
      }
    }
  } catch(err) {}
}

setInterval(() => {
  addSearchIcon_cmt();
}, 3000);

setInterval(() => {
  addSearchIcon_cmt2();
}, 3000);

setInterval(() =>{
  addSearchIcon();
}, 3000);