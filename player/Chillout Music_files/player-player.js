"use strict";

var player;
var VIDEOS_lIST = [];
var PLAYLIST_DATAS;
var LATEST = [];
var MOSTPLAYED = [];
var FAVORITES = [];
var POPULAR_MINRANK = 200;
var DONE = false;
var ulcloned;
var savedtab = 'Uploaded';
var youtubeUrl = 'http://www.youtube.com/watch/?v=';
var firstload = true;

function onYouTubeIframeAPIReady() {
    var videoId = $('.playlist li').length ?
                    $('#playlistholder .playlist li').eq(0).attr('id') : '';
    $('#playerholder').toggleClass('novideo', !videoId);

    player = new YT.Player('player', {
      height: '230',
      width: '400',
      videoId: videoId,
      playerVars: { 'autoplay': 0, 'showinfo': 0, 'fs': 0/*, 'controls': 0 , 'modestbranding': 1, "autohide": 1, 'rel' : 0*/},
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
}

function onPlayerReady(event) {
    if($('#playlistholder .playlist li').length)
        event.target.playVideo();
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED && !DONE) {
      var index = $('#playlistholder .playlist li.active').index('#playlistholder .playlist li') + 1;
      if(index >= $('#playlistholder .playlist li').length)
        index = 0;
      $('#playlistholder .playlist li').eq(index).click();
      DONE = true;
    }

    $('#playlistholder .playlist li.active span.playing').toggleClass('paused', event.data == YT.PlayerState.PAUSED);
    $('#playlistholder').toggleClass('is_paused', event.data == YT.PlayerState.PAUSED);
}

function startPlayer(){
    var li = $('#playlistholder .playlist li').eq(0);
    li.trigger('click');
}


function callApi(){
    var api_url = _API_URL +  'get_music_list2/';
    //var api_url = _API_URL + 'v2/get_music_list/';

    $.getJSON(api_url, function(data){
        if(data.count > 0){
            PLAYLIST_DATAS = data;
            VIDEOS_lIST = PLAYLIST_DATAS.items;
            LATEST = PLAYLIST_DATAS.latest;
            MOSTPLAYED = PLAYLIST_DATAS.mostplayed;
            //playlistRender(VIDEOS_lIST, []);
            var usertab = $.cookie('mystart_playerusertab');
            if(usertab !== null)
                savedtab = usertab;

            //user favorite videos
            if(savedtab == 'like')
                for(var i =0; i<LATEST.length; i++)
                    if($.cookie('favorite_' + LATEST[i]) !== null)
                        FAVORITES.push(LATEST[i]);

            //initPlaylist();

            $('#playlistholder .header .Btns.'+savedtab)
                .click();
        }
    });
}

function initPlaylist(){
     $('#playlistholder .playlist').remove();
    $('#playlistholder').append('<div class="playlist"><ul></ul></div>');
    var ul = $('#playlistholder .playlist ul');

    ul.hide();
    firstRender(ul, VIDEOS_lIST);
    ulcloned = ul.clone(true, true);
}

function playlistRender(playlist, ordertable){
    $('#playlistholder .playlist').remove();
    $('#playlistholder').append('<div class="playlist"><ul></ul></div>');
    var ul = $('#playlistholder .playlist ul');


    $('#playerholder').toggleClass('novideo', !ordertable.length);
    if(!ordertable.length)
        return;

    sortedRender(ul, playlist, ordertable);

    var container = $('#playlistholder .playlist')[0];
    Ps.initialize(container);
    Ps.update(container);

    //Playlist item click
    $('#playlistholder .playlist li').unbind('click').click(function(e) {
        var li = $(this);
        var index = li.index('#playlistholder .playlist li'),
            video_id = li.attr('id'),
            data = $('#playlistholder').data('videodatas_'+ video_id),
            h3 = $('.videoinfos h3'),
            favorite = $.cookie('favorite_' + video_id) !== null;

        if(li.hasClass('active'))
            return;

        $('#playlistholder .playlist li').toggleClass('active', false);
        li.toggleClass('active', true);

        $('.videoinfos .ranks.like pre').text(data.like);
        $('.videoinfos .ranks.dislike pre').text(data.unlike);

        $('.videoinfos .ranks.dislike span')
            .toggleClass('active', $.cookie('unlike_complete_' + video_id) !== null);

        $('.videoinfos .ranks.like span')
            .toggleClass('active', $.cookie('like_complete_' + video_id) !== null);

        $('.videoinfos .liked').toggleClass('marked', favorite);

        h3.text(data.Name)
            .data('nowplaying', video_id);
        uSubstr (h3, 2);

        player.cueVideoById(video_id);
        player.playVideo();
        DONE = false;
        ga('send', 'event', 'play', data.Name);
    });

    //Rank playing video
    $('.videoinfos .ranks span').unbind('click').click(rankVideos);



    $('span.liked').unbind('click').click(function() {
        var favorite = $(this).hasClass('marked')?0:1,
            id = $('#playlistholder .playlist li.active')
                    .attr('id');
            var li_index = 0,
                data = $('#playlistholder').data('videodatas_'+ id);

        if($(this).closest('.playlist li').length){
            id = $(this).closest('li').attr('id');
            li_index = $(this).closest('li').index('.playlist li');
            if($(this).closest('li').hasClass('active')){
                $('.videoinfos span.liked')
                    .toggleClass('marked', favorite);
                li_index = 0;
            }

        }
        else
            $('.playlist li.active span.liked')
                .toggleClass('marked', favorite);

        $(this).toggleClass('marked');

        if(favorite){
             FAVORITES.push(id);
             $.cookie('favorite_' + id, 'Saved',{ expires: 365});
        }
        else{
            $.cookie('favorite_' + id, null);
            var index = FAVORITES.indexOf(id);
            if (index > -1)
                FAVORITES.splice(index , 1 );
        }

        if($('#playlistholder .header .Btns.like.active').length){
            if(FAVORITES.length)

                if(li_index){
                    $('.playlist li').eq(index).remove();
                    Ps.update(container);
                }
                else
                    $('#playlistholder .header .Btns.like')
                        .toggleClass('active', false).click();
            else
               //$('#playlistholder .header .Btns.views').click();
            $('.playlist').html('<div class="favoritesnotice"><span class="icon displayblock"></span><h2>\
                Add favorites and they will show in this section</h2></div>');
        }

        ga('send', 'event', 'playlist favorite videos', favorite?'added':'removed', data.Name);

        return false;
    });
}

function sortedRender(ul, playlist, ordertable){

    if(!ulcloned){
        playlist = [];
        for(var i=0; i<VIDEOS_lIST.length; i++)
            if(ordertable.indexOf(VIDEOS_lIST[i].id) > -1)
                playlist.push(VIDEOS_lIST[i]);

        firstRender(ul, playlist);
        if(savedtab !== 'like')
            ulcloned = ul.clone(true, true);

        return false;
    }

    ul.empty();
    FAVORITES = [];

    var nowplaying_id = $('.videoinfos h3')
                            .data('nowplaying');

    for(var i=0; i<ordertable.length; i++){
        var li = $('li#' + ordertable[i], ulcloned),
            video_id = li.attr('id'),
            data = $('#playlistholder').data('videodatas_'+ video_id),
            favorite = $.cookie('favorite_' + data.id) !== null;

        if(li.length &&
            !$('li#' + ordertable[i], ul).length){
            li.clone().appendTo(ul);
            li = $('li#' + ordertable[i], ul);
            $('span.liked', li).toggleClass('marked', favorite);

            li.toggleClass('active', video_id == nowplaying_id);
        }

        if(favorite)
            FAVORITES.push(video_id);
        else{
            var index = FAVORITES.indexOf(video_id);
            if (index > -1)
                FAVORITES.splice(index , 1 );
        }
    }


    //if paused before
    $('#playlistholder .playlist li.active span.playing')
        .toggleClass('paused', $('#playlistholder').hasClass('is_paused'));
}


function firstRender(ul, playlist){
    ul.empty();
    FAVORITES = [];

    $.each(playlist, function( index, data ) {

        var favorite = $.cookie('favorite_' + data.id) !== null;
        var li = $('<li/>', {id: data.id, 'data-like': data.like, title: data.Name});

        li.html('<img src="'+data.image.small+'"><h3 id = "h3_'+data.id + '">'+ data.Name+'</h3>' +
                    '<p class="text">by '+data.Author + '</p><span class="playing"></span>' +
                    '<span class="liked' +(favorite?' marked':'') + '"></span>');

        $('#playlistholder').data('videodatas_'+data.id, data);

        li.appendTo(ul);
        uSubstr ($('#h3_'+data.id), 2);

        if(favorite)
            FAVORITES.push(data.id);
        else{
            var index = FAVORITES.indexOf(data.id);
            if (index > -1)
                FAVORITES.splice(index , 1 );
        }
    });
}



function rankVideos(e){
    //like, item
    var btn = $(e.currentTarget),
        id = $('#playlistholder .playlist li.active')
                .attr('id'),
        img = youtubeUrl + id,
        action = btn.closest('.ranks')
                    .attr('class').substring(6),
        vaction2 = 0,
        data = {img:img},
        action2;

    if(action == 'like')
        action2 = 'unlike';
    else{
        action2 = 'like';
        action = 'unlike';
    }

    if(btn.hasClass('active'))
        return false;

    $('.videoinfos .ranks span').toggleClass('active', false);
    btn.toggleClass('active', true);


    if($.cookie(action + '_complete_' + id) === null) {
        if($.cookie(action2 + '_complete_' + id) !== null)
            vaction2 = 1;

        data['like'] = action == 'like'?1:0;
        data[action2+'_stat'] = vaction2;

        $.post(_API_URL + 'set_background_stats/', data, function(response) {
            if(response !== true)
               return;

            $.cookie(action + '_complete_' + id, 'Saved',{ expires: 365});
            $.cookie(action2 + '_complete_' + id, null);

            $.getJSON(_API_URL+'get_background_stats/?image_src='+encodeURIComponent(img)+'&callback=?',
                function(response) {
                    //console.log(response);
                    ga('send', 'event', action, 'list-view', id);
                    $('.videoinfos .ranks.like pre').text(response.no_of_like);
                    $('.videoinfos .ranks.dislike pre').text(response.no_of_unlike);
                }
            );
        });
    }
}

function uSubstr (selector, nb_lignes){

    var elmts = typeof selector=="object"?selector:$(selector), t, h, tab_texte, t0;
    if(!(elmts.length && nb_lignes))
        return false;

    elmts.each(function(){
        var conteneur = $(this);
        t = conteneur.html();
        t0='';
        for(var i=0;i<nb_lignes;i++) t0 += (t0?'<br>':'')+'|';
        conteneur.html(t0);
        h = conteneur.actual('innerHeight');
        var tab_texte = t.split(' '), texte = '';
        for (var i = 0; i < tab_texte.length; i++){
          conteneur.html(texte+' '+tab_texte[i]+'...');
          if(conteneur.actual('innerHeight')>h){
            conteneur.html(texte+'...');
            break;
          }
          else texte += ' '+tab_texte[i];
        }
        if (i >=tab_texte.length) conteneur.html(texte);
    });
}


$( document ).ready(function() {
    var Wsize = 816,
        hsize = 360;  //public variable

    var mytimer = setTimeout(function() {
        var heightOffset = window.outerHeight - window.innerHeight;
        var widthOffset = window.outerWidth - window.innerWidth;
        hsize = document.getElementById("mediaBox").clientHeight + heightOffset;
        Wsize = document.getElementById("mediaBox").clientWidth + widthOffset;
        window.resizeTo(Wsize, hsize);

        $(window).resize(function(){
            window.resizeTo(Wsize, hsize);
        });

        clearTimeout(mytimer);

    }, 100);



    //Sort videos
    $('#playlistholder .header .Btns').unbind('click').click(function() {
        var op = $(this).attr('class').replace(' active', '').substring(5),
            ordertable,
            myInterval;

        if(op == 'like')
            ordertable = FAVORITES;

        if(op == 'views')
            ordertable = MOSTPLAYED;

        if(op == 'Uploaded')
            ordertable = LATEST;

        $('#playlistholder .header .Btns').toggleClass('active', false);
        $(this).toggleClass('active', true);
        $('#playlistholder #genre').html($(this).attr('title'));

        $.cookie('mystart_playerusertab', op,{ expires: 365});
        savedtab = op;

        ga('send', 'event', 'select sort', 'click', $(this).attr('title'));

        if(op == 'like' && !FAVORITES.length){
            $('.playlist').html('<div class="favoritesnotice"><span class="icon displayblock"></span><h2>\
                No Favorites yet</h2><p>Add favorites and they will show in this section.</p></div>');
            return;
        }

        playlistRender(VIDEOS_lIST, ordertable);

        if(firstload)
            myInterval = setInterval(function() {
                if(player && player.cueVideoById){
                    startPlayer();
                    clearInterval(myInterval);
                    firstload = false;
                }
            }, 100);

    });


    callApi();

    // 1. This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      var myInterval = setInterval(function() {
         if(player && player.cueVideoById){
            startPlayer();
            clearInterval(myInterval);
         }
      }, 1500);

});
