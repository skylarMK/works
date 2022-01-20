(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = 'https://connect.facebook.net/zh_TW/sdk.js#xfbml=1&autoLogAppEvents=1&version=v3.2&appId=1385360291698338';
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

window.fbAsyncInit = function () {
    FB.init({
        appId: '1385360291698338',
        // cookie: true,
        xfbml: true,
        version: 'v3.2'
    });
};

var facebookMe = {
    id: "",
    name: "",
    email: "",
    accessToken: "",
    target: {
        hashtag: "#三立新聞網活動",
        refer: "",
        href: ""
    },
    connect: function (callback) {
        FB.getLoginStatus(function (response) {
            if (response.status == 'connected') {
                facebookMe.id = response.authResponse.userID;
                facebookMe.accessToken = response.authResponse.accessToken;

                FB.api('/me?fields=id,name,email,picture', function (response) {
                    facebookMe.id = response.id;
                    facebookMe.name = response.name;
                    facebookMe.email = response.email;

                    var frm = new FormData();
                    frm.append('action', 'connect');
                    frm.append('id', facebookMe.id);
                    frm.append('name', facebookMe.name);
                    frm.append('email', facebookMe.email);

                    fetch(
                        "https://event.setn.com/api/event-public-api/collection",
                        {
                            method: 'POST',
                            body: frm
                        })
                        .then(res => res.text())
                        .then(text => console.log(text));

                });

                callback();
            } else {
                FB.login(function (response) {
                    if (response.status == 'connected') {
                        facebookMe.connect(callback);
                    }
                }, {
                    scope: 'email, public_profile',
                    return_scopes: true
                });
            }
        });
    },
    share: function () {
        if (facebookMe.id == "") {
            facebookMe.connect(facebookMe.share);
            return true;
        }

        FB.ui({
            method: "share",
            mobile_iframe: true,
            hashtag: facebookMe.target.hashtag,
            href: facebookMe.target.href
        }, function (response) {
            var frm = new FormData();
            frm.append('action', 'share');
            frm.append('event', facebookMe.target.refer);
            frm.append('target', facebookMe.target.href);
            frm.append('id', facebookMe.id);
            frm.append('accessToken', facebookMe.accessToken);
            frm.append('message', response.error_message);

            fetch(
                "https://event.setn.com/api/event-public-api/collection",
                {
                    headers: {
                        "accept": "application/json"
                    },
                    method: 'POST',
                    body: frm
                })
                .then(res => res.text())
                .then(text => console.log(text));
        })
    }
};

$(document).ready(function () {
    $(document)
        .on("click", ".fb_share", function (e) {
            facebookMe.target.refer = this.dataset.refer || facebookMe.target.refer;
            facebookMe.target.href = this.dataset.href || facebookMe.target.href;
            facebookMe.target.hashtag = this.dataset.hashtag || facebookMe.target.hashtag;
            facebookMe.share();
        });
});
