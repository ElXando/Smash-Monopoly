var ctx;
var currentlyAnimating = false;
var currentTurn = 0;
var players = [];
var playerColours = ['rgba(255,0,0)','rgba(0,0,255)','rgba(31, 178, 90)','rgba(247, 148, 29)'];
var house = new Image();
house.src = 'house.png';
var hotel = new Image();
hotel.src = 'hotel.png';
var boardMiddle = new Image();
boardMiddle.src = 'top_image.png';
var losingCharacterIndex, recentWinner;

var standardWidth = 83,
    standardHeight = 127;

var slotTypes = [
    {type: 'chest', characters: ['kazuya', 'pacman', 'falcon'], pool: ['falcon', 'inkling', 'joker', 'snake', 'wiifit', 'bayonetta']},
    {type: 'chance', characters: ['gandw', 'luigi', 'hero'], pool: ['gandw', 'hero', 'pacman', 'duckhunt', 'wario', 'rosalina']},
    {type: 'visiting', characters: ['visiting'], pool: ['steve', 'kazuya', 'rob']},
    {type: 'banned', characters: ['banned']},
    {type: 'tobanned', characters: ['tobanned']},
    {type: 'free', characters: ['go', 'freecharacter']},
    {type: 'lowtiertax', characters: ['littlemac', 'miigunner'], pool: ['littlemac', 'drmario', 'iceclimbers', 'sora', 'banjo']},
    {type: 'lametax', pool: ['megaman', 'olimar', 'sonic', 'minmin']},
    {type: 'utility', characters: ['mythra', 'pyra'], pool: [['bowser', 'bowserjr'], ['simon', 'richter']], one: [0,0,10,10,20,20,30,30,40,40,50,50,60], two: [0,0,20,30,40,50,60,60,80,80,100,100,125]},
    {type: 'station', characters: ['lucina', 'chrom', 'marth', 'roy'], pool: ['byleth', 'chrom', 'corrin', 'ike', 'lucina', 'marth', 'robin', 'roy'], handicaps: [0, 20, 40, 80, 150]},
    {type: 'brown', colour: '#965336', characters: ['ken', 'ryu'], pool: [['villager', 'isabelle'], ['ken', 'ryu']], handicap: 10, handicapSet: 20},
    {type: 'lightblue', colour: '#aae0fa', characters: ['wolf', 'falco', 'fox'], pool: [['fox', 'falco', 'wolf'], ['pit', 'darkpit', 'palutena']], handicap: 20, handicapSet: 30},
    {type: 'pink', colour: '#d93a96', characters: ['kirby', 'metaknight', 'kingdedede'], pool: [['kirby', 'kingdedede', 'metaknight'], ['shulk', 'mythra', 'pyra']], handicap: 30, handicapSet: 50},
    {type: 'orange', colour: '#f7941d', characters: ['donkeykong', 'diddykong', 'krool'], pool: [['samus', 'zss', 'ridley', 'darksamus'], ['donkeykong', 'diddykong', 'krool']], handicap: 40, handicapSet: 60},
    {type: 'red', colour: '#ed1b24', characters: ['mario', 'peach', 'bowser'], pool: ['mario', 'peach', 'plant', 'daisy', 'yoshi', 'luigi'], handicap: 50, handicapSet: 80},
    {type: 'yellow', colour: '#fef200', characters: ['pikachu', 'jigglypuff', 'trainer'], pool: ['pichu', 'pikachu', 'jigglypuff', 'charizard', 'ivysaur', 'squirtle', 'mewtwo', 'incineroar', 'greninja', 'lucario'], handicap: 60, handicapSet: 100},
    {type: 'green', colour: '#1fb25a', characters: ['link', 'zelda', 'ganondorf'], pool: ['ganondorf', 'link', 'toonlink', 'younglink', 'zelda', 'sheik'], handicap: 80, handicapSet: 125},
    {type: 'blue', colour: '#0072bb', characters: ['cloud', 'sephiroth'], pool: [['cloud', 'sephiroth'], ['ness', 'lucas']], handicap: 100, handicapSet: 150}
];

var friendlyNames = {
    'falcon': 'Captain Falcon',
    'wiifit': 'Wii Fit Trainer',
    'gandw': 'Game & Watch',
    'duckhunt': 'Duck Hunt',
    'rosalina': 'Rosalina & Luma',
    'littlemac': 'Little Mac',
    'drmario': 'Dr Mario',
    'iceclimbers': 'Ice Climbers',
    'banjo': 'Banjo & Kazooie',
    'bowserjr': 'Bowser Jr',
    'darkpit': 'Dark Pit',
    'kingdedede': 'King Dedede',
    'metaknight': 'Meta Knight',
    'zss': 'Zero Suit Samus',
    'darksamus': 'Dark Samus',
    'donkeykong': 'Donkey Kong',
    'diddykong': 'Diddy Kong',
    'krool': 'King K. Rool',
    'plant': 'Piranha Plant',
    'toonlink': 'Toon Link',
    'younglink': 'Young Link',
    'megaman': 'Mega Man',
    'minmin': 'Min Min'
};

var images = {};

function loadImages(){
    var canvasFont = new FontFace('Futura PT Medium', 'url(font/FuturaCyrillicMedium.woff)');
    canvasFont.load();

    $('.player_token_select').each(function(index, element){
        $(this).html($('#player_tokens').html());
        $(this).val($('#player_tokens option:eq('+index+')').val());
    });
    $('.player_token_select').selectpicker();
    $('.player_token_select').on('show.bs.select', function(){
        var currentSelect = $(this);
        currentSelect.find('option').removeAttr('disabled');
        $('.player_token_select:not(#'+currentSelect.attr('id')).each(function(){
            currentSelect.find('option[value="'+$(this).val()+'"]').attr('disabled', true);
        });
        $(this).selectpicker('refresh');
    });

    var image, folder, extension;
    $.each(slotTypes, function(slotIndex, slotType){
        if (slotType.pool){
            folder = ['station', 'chest', 'chance', 'visiting'].includes(slotType.type) ? slotType.type : 'slots';
            extension = folder == 'slots' ? 'webp' : 'jpg';
            $.each(slotType.pool, function(poolIndex, poolItem){
                if (Array.isArray(poolItem)){
                    $.each(poolItem, function(innerIndex, innerPool){
                        image = new Image();
                        image.src = folder + '/' + innerPool + '.' + extension;
                        images[innerPool] = image;
                    });
                } else {
                    image = new Image();
                    image.src = folder + '/' + poolItem + '.' + extension;
                    images[poolItem] = image;
                }
            });
        }
    });
}

var corners = [
    {
        name: 'go',
        left:873,
        right:1000,
        top:873,
        bottom:1000,
        index: 0,
        //next: ['ken', 'kazuya', 'ryu', 'littlemac', 'lucina', 'wolf', 'gandw', 'falco', 'fox'],
        next: ['brown', 'chest', 'brown', 'lowtiertax', 'station', 'lightblue', 'chance', 'lightblue', 'lightblue'],
        add: [],
        type: 'free'
    },
    {
        name: 'visiting',
        left: 0,
        right: 127,
        top: 871,
        bottom: 1000,
        index:10,
        pool: ['steve', 'kazuya', 'rob'],
        //next: ['kirby', 'mythra', 'metaknight', 'kingdedede', 'chrom', 'donkeykong', 'pacman', 'diddykong', 'krool'],
        next: ['pink', 'utility', 'pink', 'pink', 'station', 'orange', 'chest', 'orange', 'orange'],
        add: [],
        type: 'visiting'
    },
    {
        name: 'freecharacter',
        left:0,
        right:127,
        top: 0,
        bottom: 127,
        index:20,
        //next: ['mario', 'luigi', 'peach', 'bowser', 'marth', 'pikachu', 'jigglypuff', 'pyra', 'trainer'],
        next: ['red', 'chance', 'red', 'red', 'station', 'yellow', 'yellow', 'utility', 'yellow'],
        add: [],
        type: 'free'
    },
    {
        name: 'tobanned',
        left:873,
        right:1000,
        top:0,
        bottom:127,
        index:30,
        //next: ['link', 'zelda', 'falcon', 'ganondorf', 'roy', 'hero', 'cloud', 'miigunner', 'sephiroth'],
        next: ['green', 'green', 'chest', 'green', 'station', 'chance', 'blue', 'lametax', 'blue'],
        add: [],
        type: 'tobanned'
    },
    {
        name: 'banned',
        left:0,
        right: 127,
        top: 871,
        bottom: 1000,
        index: 40,
        type: 'banned'
    }
];

var slots = [];

function configureGame(){
    // Create "token" object with settings
    players.push(new token(0, 936, 936, $('#player_0').val(), $('#player_0_icon').val()));
    // Add player name and colour to section
    $('.player[data-number="0"], #p0name').prepend($('#player_0').val()).css('color', playerColours[0]);
    // Add player name and colour to win button and board area
    $('#p0button').html($('#player_0').val()).css('background-color', playerColours[0]);
    // Player 2
    players.push(new token(1, 936, 936, $('#player_1').val(), $('#player_1_icon').val()));
    $('.player[data-number="1"], #p1name').prepend($('#player_1').val()).css('color', playerColours[1]);
    $('#p1button').html($('#player_1').val()).css('background-color', playerColours[1]);
    if ($('#player_2').val()){
        players.push(new token(2, 936, 936, $('#player_2').val(), $('#player_2_icon').val()));
        $('.player[data-number="2"], #p2name').prepend($('#player_2').val()).css('color', playerColours[2]).removeClass('hidden');
        $('#p2button').html($('#player_2').val()).css('background-color', playerColours[2]).removeClass('hidden');
        if ($('#player_3').val()){
            players.push(new token(3, 936, 936, $('#player_3').val(), $('#player_3_icon').val()));
            $('.player[data-number="3"], #p3name').prepend($('#player_3').val()).css('color', playerColours[3]).removeClass('hidden');
            $('#p3button').html($('#player_3').val()).css('background-color', playerColours[3]).removeClass('hidden');
        }
    }
    $('#setup_div').addClass('hidden');
    $('#game_div').removeClass('hidden');
    game.start();
}

var game = {
    canvas: document.getElementById('game'),
    start: function(){
        this.canvas.width = 1000;
        this.canvas.height = 1000;
        this.canvas.addEventListener('mousedown', function(e){
            getCursorPosition(game.canvas, e);
        });
        this.context = this.canvas.getContext('2d');
        this.frameNo = 0;
        populateSlots();
    },
    clear: function(){
        this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
    },
    stop: function(){

    }
};

function image(width, height, path, x, y){
    this.image = new Image();
    this.image.src = path;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.update = function(){
        ctx = game.context;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

function token(playerIndex, x, y, name, icon){
    this.playerIndex = playerIndex;
    this.icon = icon;
    this.image = new Image();
    this.image.src = 'tokens/'+icon+'.png';
    this.name = name;
    this.index = 0;
    this.targetIndex = 0;
    this.progress = 0;
    this.x = x;
    this.y = y;
    this.update = function(){
        ctx = game.context;

        if (this.index != this.targetIndex){
            this.progress++;
            if (this.progress == 10){
                this.progress = 0;
                this.index++;
                if (this.index == 40){
                    this.index = 0;
                }
                if (this.index == this.targetIndex){
                    if (this.banned){
                        this.index = 40;
                        this.targetIndex = 40;
                    }
                    currentlyAnimating = false;
                }
            }
        }

        var occupiedSlot = slots[this.index],
            nextIndex = this.index + 1 == 40 ? 0 : this.index + 1,
            nextSlot = slots[nextIndex];

        this.x = (occupiedSlot.left + occupiedSlot.right) / 2;
        this.y = (occupiedSlot.top + occupiedSlot.bottom) / 2;
        if (this.index != this.targetIndex){
            this.nextX = (nextSlot.left + nextSlot.right) / 2;
            this.nextY = (nextSlot.top + nextSlot.bottom) / 2;
            this.diffX = this.nextX - this.x;
            this.diffY = this.nextY - this.y;
            this.diffX = this.diffX / 10 * this.progress;
            this.diffY = this.diffY / 10 * this.progress;
            this.x = this.x + this.diffX;
            this.y = this.y + this.diffY;
        }
        switch (this.playerIndex){
            case 0:
                this.x -= 13;
                this.y -= 13;
                if (this.index == 10){
                    this.x -= 30;
                }
                break;
            case 1:
                this.x += 13;
                this.y -= 13;
                if (this.index == 10){
                    this.x -= 56;
                    this.y += 26;
                }
                break;
            case 2:
                this.x -= 13;
                this.y += 13;
                if (this.index == 10){
                    this.y += 30;
                }
                break;
            case 3:
                this.x += 13;
                this.y += 13;
                if (this.index == 10){
                    this.y += 30;
                }
                break;
        }
        this.x -= 25;
        this.y -= 25;
        ctx.drawImage(this.image, this.x, this.y, 50, 50);
    }
}

function strokeRectangle(width, height, x, y, color){
    ctx = game.context;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth=3;
    ctx.strokeRect(x, y, width, height);
}

function randomiseBoard(){
    $.each(slotTypes, function(index, slot){
        slot.count = undefined;
    });
    slots = [];
    populateSlots();
}

function populateSlots() {
    $.each(corners, function (index, item) {
        // First draw that corner
        var height = item.bottom - item.top,
            width = item.right - item.left;
        strokeRectangle(width, height, item.left, item.top, 'red');
        // Now populate slots between with next
        var direction, startX, startY;
        if (item.type == 'visiting'){item.name = 'visiting';}
        switch (item.name) {
            case 'go':
                direction = 'right_left';
                startX = item.left;
                startY = item.top;
                break;
            case 'visiting':
                direction = 'bottom_top';
                startX = item.left;
                startY = item.top;
                break;
            case 'freecharacter':
                direction = 'left_right';
                startX = item.right - standardWidth;
                startY = item.top;
                break;
            case 'tobanned':
                direction = 'top_bottom';
                startX = item.left;
                startY = item.bottom - standardWidth;
                break;
        }

        if (item.type == 'visiting'){
            item.name = item.pool[~~(Math.random()*3)];
            item.icon = images[item.name];
        }

        slots.push(item);

        $.each(item.next, function (index, nextType) {
            var character, slotIndex;
            var slotType = slotTypes.find(function(type){return type.type == nextType;});
            if (typeof slotType.count == 'undefined'){ // First time on this slot, randomise pool!
                slotType.pool.sort(() => 0.5 - Math.random());
                if (Array.isArray(slotType.pool[0])){
                    slotType.pool[0].sort(() => 0.5 - Math.random());
                    character = slotType.pool[0][0];
                } else {
                    character = slotType.pool[0];
                }
                slotType.count = 0;
            } else {
                slotType.count++;
                if (Array.isArray(slotType.pool[0])){
                    character = slotType.pool[0][slotType.count];
                } else {
                    character = slotType.pool[slotType.count];
                }
            }

            var width, height, ownLeft, ownTop, iconX, iconY;
            switch (direction) {
                case 'right_left':
                    startX -= standardWidth;
                    width = standardWidth;
                    height = standardHeight;
                    ownLeft = startX;
                    ownTop = startY;
                    iconX = startX + (standardWidth / 2);
                    iconY = startY + standardHeight - 35;
                    break;
                case 'bottom_top':
                    startY -= standardWidth;
                    height = standardWidth;
                    width = standardHeight;
                    ownLeft = startX + standardHeight;
                    ownTop = startY;
                    iconX = startX + 35;
                    iconY = startY + (standardWidth / 2);
                    break;
                case 'left_right':
                    startX += standardWidth;
                    width = standardWidth;
                    height = standardHeight;
                    ownLeft = startX + standardWidth;
                    ownTop = startY + standardHeight;
                    iconX = startX + (standardWidth / 2);
                    iconY = startY + 35;
                    break;
                case 'top_bottom':
                    startY += standardWidth;
                    height = standardWidth;
                    width = standardHeight;
                    ownLeft = startX;
                    ownTop = startY + standardWidth;
                    iconX = startX + standardHeight - 35;
                    iconY = startY + (standardWidth / 2);
                    break;
            }
            var isProperty = !['chest', 'chance', 'banned', 'free', 'lowtiertax', 'lametax'].includes(nextType);
            /*var icon = new Image();
            icon.onload = function(){
                /*var icon_slot = slots.find(function(slot){return slot.name == character});
                ctx.drawImage(icon, icon_slot.iconX-35, icon_slot.iconY-35, 70, 70);*/
            //}
            /*icon.onerror = function(){
                var icon_slot = slots.find(function(slot){return slot.name == character});
                icon_slot.icon = undefined;
            }
            var folder = ['station', 'chest', 'chance', 'visiting'].includes(type) ? type : 'slots';
            var extension = folder == 'slots' ? 'webp' : 'jpg';
            icon.src = folder+'/'+character+'.' + extension;*/
            var characterObj = {
                name: character,
                left: startX,
                right: startX + width,
                top: startY,
                bottom: startY + height,
                ownLeft: ownLeft,
                ownTop: ownTop,
                iconX: iconX,
                iconY: iconY,
                icon: images[character],
                direction: direction,
                index: item.index + index + 1,
                property: isProperty,
                owner: undefined,
                house: false,
                hotel: false,
                type: nextType
            };
            slots.push(characterObj);
            strokeRectangle(width, height, startX, startY, 'blue');
        });
    });
    updateGameArea();
    /*for (var i = 0; i < 40; i += 10) {
        $.each(slots[i].add, function (index, item) {
            slots.splice(i + 1 + index, 0, item);
        });
    }*/
}

function drawOwners(){
    ctx = game.context;
    // Add middle image
    ctx.save();
    ctx.translate(500, 500);
    ctx.rotate(-48 * Math.PI / 180);
    ctx.drawImage(boardMiddle, -240, -135, 480, 270);
    ctx.restore();
    //ctx.font = '20px Arial';
    $('.owned_characters').html('');
    $.each(slots, function(index, item){
        var rotateBy, offsetX = 0, offsetY = 0;
        switch (item.direction){
            case 'right_left':
                rotateBy = 0;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                offsetX += item.hotel ? 50 : 60;
                offsetY += item.hotel ? 0 : 5;
                break;
            case 'bottom_top':
                rotateBy = Math.PI/2;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'bottom';
                offsetY += item.hotel ? 0 : 5;
                offsetX += item.hotel ? 50 : 60;
                break;
            case 'left_right':
                rotateBy = Math.PI;
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                offsetX += item.hotel ? 50 : 60;
                offsetY += item.hotel ? 0 : 5;
                break;
            case 'top_bottom':
                rotateBy = -Math.PI / 2;
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';
                offsetY += item.hotel ? 0 : 5;
                offsetX += item.hotel ? 50 : 60;
                break;
        }
        var characterColour = getSlotProperty(item.type, 'colour');
        if (characterColour == undefined){
            characterColour = '';
        }
        // Add text
        /*ctx.save();
        ctx.translate(item.ownLeft, item.ownTop);
        ctx.rotate(rotateBy);
        ctx.fillStyle = 'white';
        ctx.fillText(players[item.owner].name, 0, 0);
        ctx.restore();*/

        // Add icon & text
        if (item.icon){
            ctx.save();
            var x,y,w,h,addText = false;
            if (['chest', 'chance', 'station'].includes(item.type)){
                x = item.ownLeft;y=item.ownTop;w=standardWidth;h=standardHeight;
            } else if (['go', 'visiting', 'freecharacter', 'tobanned'].includes(item.type)){
                x = item.left,y=item.top;w=standardHeight;h=standardHeight;
            } else {
                x = item.iconX;y=item.iconY;w=70;h=70;addText = true;
            }
            ctx.translate(x, y);
            ctx.rotate(rotateBy);
            if (addText){
                ctx.drawImage(item.icon, -35, -35, w, h);
                ctx.font = '13px "Futura PT Medium"';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';
                var characterText = friendlyNames[item.name] ? friendlyNames[item.name] : item.name;
                characterText = characterText.toUpperCase();
                if (characterText.length >= 10){
                    characterText = characterText.split(' ');
                } else {
                    characterText = [characterText];
                }


                if (characterText[1] == '&'){
                    // put & on shorter line
                    if (characterText[0].length < characterText[2].length){
                        characterText[0] = characterText[0] + ' &';
                    } else {
                        characterText[2] = '& ' + characterText[2];
                    }
                    characterText.splice(1,1);
                }
                if (characterText[1] == 'K.'){
                    characterText[0] = 'KING K.';
                    characterText.splice(1,1);
                }
                if (characterText[1] == 'SUIT'){
                    characterText[0] = 'ZERO SUIT';
                    characterText.splice(1,1);
                }
                for (var i = 0; i < characterText.length; i++){
                    ctx.fillText(characterText[i], 0, -50 + (i * 10));
                }

                ctx.font = '17px "Futura PT Medium"';
                if (item.type == 'utility'){
                    ctx.fillText(item.type.toUpperCase(), 0, -70);
                } else if (item.type.includes('tax')){
                    ctx.fillText(item.type == 'lowtiertax' ? 'LOW TIER' : 'LAME', 0, -80);
                    ctx.fillText('TAX', 0, -65);
                }
            } else {
                var xOffset = 0, yOffset = 0;
                if (['chest', 'chance'].includes(item.type)){
                    yOffset = -2;
                }
                if (item.type == 'station'){
                    yOffset = -1;
                }
                ctx.drawImage(item.icon, xOffset, yOffset, w, h);
            }


            ctx.restore();
        }


        // Place player icon
        if (item.owner || item.owner === 0) {
            var characterName = friendlyNames[item.name] ? friendlyNames[item.name] : item.name;
            characterName = characterName.charAt(0).toUpperCase() + characterName.slice(1);
            $('.player[data-number="'+item.owner+'"] .owned_characters').append('<span style="width:100%;border:2px solid black;color:white;background-color:'+characterColour+'">'+characterName+'</span><br />');
            // Translucent rectangle over whole spot
            //ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
            ctx.fillStyle = playerColours[item.owner].replace(')', ',0.2)');
            ctx.fillRect(item.left, item.top, item.right-item.left, item.bottom-item.top);

            ctx.save();
            ctx.translate(item.ownLeft, item.ownTop);
            ctx.rotate(rotateBy)
            ctx.drawImage(players[item.owner].image, 5, 5, 20, 20);
            if (item.hotel) {
                ctx.drawImage(hotel, offsetX, offsetY, 30, 30);
            } else if (item.house) {
                ctx.drawImage(house, offsetX, offsetY, 20, 20);
            }
            ctx.restore();
        }
    });
}

function getCursorPosition(canvas, event){
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log('x: ' + x + ', y: ' + y);
    if (losingCharacterIndex || losingCharacterIndex === 0){
        var clickedSlot = slots.filter(function(slot){
            return slot.left < x && slot.right > x && slot.top < y && slot.bottom > y;
        });
        if (clickedSlot.length){
            console.log(clickedSlot[0].name);
            if (clickedSlot[0].owner === losingCharacterIndex){
                $('#top_board').append(recentWinner.name + ' has stolen ' + clickedSlot[0].name);
                clickedSlot[0].owner = recentWinner.playerIndex;
                clickedSlot[0].justWon = true;
                console.log('now check player');
                loserCheck(losingCharacterIndex+1);
                losingCharacterIndex = undefined;
            } else {
                $('#top_board').append(players[losingCharacterIndex].name + ' does not own ' + clickedSlot[0].name + '!<br />');
            }
        } else {
            $('#top_board').append('Please click a valid character!');
        }
    }

}

function getCharacterType(character){
    return slotTypes.find(function(types){return types.characters.includes(character);}).type;
}

function getSlotProperty(type, property){
    return slotTypes.find(function(types){return types.type == type})[property];
}

function rollDice() {
    $('#roll_dice').addClass('hidden');
    var loops = 0;
    var dice_roll = setInterval(function () {
        var die1 = ~~(Math.random() * 6) + 1,
            die2 = ~~(Math.random() * 6) + 1;
        var pip = '<span class="pip"></span>';
        $('#die_1').html(pip.repeat(die1));
        $('#die_2').html(pip.repeat(die2));
        loops++;
        if (loops == 10) {
            clearInterval(dice_roll);
            diceResult(die1, die2);
        }
    }, 50);
}

function diceResult(die1, die2){
    var currentToken = players[currentTurn];

    currentTurn++;

    if (currentTurn > players.length-1){
        $('.win').removeClass('hidden');
        $('.roll').addClass('hidden');
        $('#top_board').html('FIGHT!!!');
    }

    if (die1 == die2 && currentToken.banned){
        $('#top_board').html('Rolled doubles, unbanned!');
        currentToken.banned = false;
    }

    if (currentToken.banned){
        $('#top_board').html('still banned!');
        $('#roll_dice').removeClass('hidden');
        return;
    }

    var total = die1 + die2;
    if ($('#override').val()){
        total = parseInt($('#override').val());
    }
    currentToken.targetIndex += total;
    if (currentToken.targetIndex >= 40){
        currentToken.targetIndex -= 40;
    }
    var newSlot = slots[currentToken.targetIndex],
        slotType = newSlot.type;

    var slotOwned = typeof newSlot.owner != 'undefined' && newSlot.owner != currentToken.playerIndex;
    var ownedCount = slotOwned ? slots.filter(function(slot){return slot.owner == newSlot.owner && slot.type == slotType}).length : 0;
    var setTotal = slots.filter(function(slot){return slot.type == slotType}).length;
    var characterToPlay = newSlot.name;
    if (friendlyNames[characterToPlay]){
        characterToPlay = friendlyNames[characterToPlay];
    }
    characterToPlay = characterToPlay.toUpperCase();
    var handicap = 0;
    switch (slotType){
        case 'free':
            //alert('free character!');
            var characterIndex = claimRandomCharacter(currentToken);
            if (!characterIndex){
                characterToPlay = 'Choice';
            }
            break;
        case 'tobanned':
            currentToken.banned = true;
            characterToPlay = slots[40].name;

            break;
        case 'chest':
        case 'chance':
            //alert('get chest or chance!');
            currentToken.characterWin = true;
            break;
        case 'visiting':
            characterToPlay ='CHOICE';
            break;
        case 'tax':
            // nothing special?
            break;
        case 'utility':
            if (slotOwned){ // if someone else owns the utility
                if (ownedCount == 2){
                    handicap = getSlotProperty(slotType, 'two')[total];
                } else {
                    handicap = getSlotProperty(slotType, 'one')[total];
                }
            }
            break;
        case 'station':
            if (slotOwned){
                handicap = getSlotProperty(slotType, 'handicaps')[ownedCount];
            }
            break;
        default:
            if (slotOwned){
                if (ownedCount == setTotal){
                    handicap = getSlotProperty(slotType, 'handicapSet');
                } else {
                    handicap = getSlotProperty(slotType, 'handicap');
                }
            }
            console.log(slotType);
    }

    $('#p'+currentToken.playerIndex+'settings').html(characterToPlay + '<br ><span class="handicap handicap-'+handicap+'">'+handicap+'%</span>');

    $('#top_board').html('You rolled ' + die1 + ' and ' + die2 + ': ' + total + ', landing on ' + slots[currentToken.targetIndex].name);

    currentlyAnimating = true;
    window.requestAnimationFrame(updateGameArea)
}

function claimRandomCharacter(claimer, claimee){
    var charactersToClaim = slots.filter(function(character){return character.property && typeof character.owner == 'undefined'});
    if (claimee){
        charactersToClaim = slots.filter(function(character){return character.property && character.owner == claimee.playerIndex});
    }
    if (!charactersToClaim.length){
        $('#top_board').html('No characters to claim!!');
        return;
    }
    var claimedIndex = charactersToClaim[~~(Math.random() * charactersToClaim.length)].index;
    var claimedCharacter = slots[claimedIndex].name;
    slots[claimedIndex].owner = claimer.playerIndex;
    if (claimee){
        $('#top_board').append(claimedCharacter + ' has been stolen!');
    } else {
        $('#top_board').append('You won ' + claimedCharacter + '!');
    }
    return claimedIndex;
}

function Win(player){
    $('.settings_div').html('');
    currentTurn = 0;
    recentWinner = players[player];
    //loser = player == 1 ? p2Token : p1Token;
    // Winner is unbanned
    recentWinner.banned = false;
    // If the loser is on a property owned by opponent, winner steals a random character
    /*if (slots[loser.index].owner == winner.playerIndex){
        claimRandomCharacter(winner, loser);
    }*/
    // Other player checks
    $('#top_board').html('');
    loserCheck(0);
}

function loserCheck(playerIndex){
    console.log('loser check ' + playerIndex);
    if (playerIndex === players.length){
        loserChecksDone();
        return;
    }
    // Don't process winner, either jump to next or loser checks are done!
    if (playerIndex == recentWinner.playerIndex){
        loserCheck(playerIndex+1);
        return;
    }
    var loser = players[playerIndex];
    loser.characterWin = false;
    // If lost on the winners hotel, they get to pick a character
    if (slots[loser.index].hotel && slots[loser.index].owner == recentWinner.playerIndex){
        // Check if loser has any characters to lose!
        if (slots.filter(function(slot){return slot.owner === playerIndex}).length){
            $('#top_board').append('Please pick one of ' + loser.name + '\'s characters to steal!<br />');
            losingCharacterIndex = playerIndex;
        } else {
            $('#top_board').append(loser.name + ' has no characters to steal!<br />');
            loserCheck(playerIndex+1);
        }
    } else if (slots[loser.index].house && slots[loser.index].owner === recentWinner.playerIndex){
        // Losing on winners house, lose a character from the series if you have one
        var losersInSets = slots.filter(function(slot){return slot.type == slots[loser.index].type && slot.owner == playerIndex});
        if (losersInSets.length){
            $('#top_board').append(players[playerIndex].name + ' has lost ' + losersInSets[0].name + '<br />');
            losersInSets[0].owner = recentWinner.playerIndex;
            losersInSets[0].justWon = true;
        } else {
            $('#top_board').append(players[playerIndex].name + ' has no ' + slots[loser.index].type + ' characters to steal!<br />');
        }
        loserCheck(playerIndex+1);
    } else {
        loserCheck(playerIndex+1);
    }

}

function loserChecksDone(){
    console.log('loser checks done');
    // If the slot the winner is on is an unclaimed property, they win it
    if (!slots[recentWinner.index].justWon){
        if (typeof slots[recentWinner.index].owner == 'undefined' && slots[recentWinner.index].property){
            slots[recentWinner.index].owner = recentWinner.playerIndex;
        } else if (slots[recentWinner.index].owner === recentWinner.playerIndex && !['station', 'utility'].includes(slots[recentWinner.index].type)){
            // If they won on their own property which isn't a station or utility
            if (!slots[recentWinner.index].house){ // Make a house if not yet
                slots[recentWinner.index].house = true;
            } else { // Otherwise make a hotel!
                slots[recentWinner.index].hotel = true;
            }
        }
    }

    // If the recentWinner is on chance or community chest, give them a random character
    if (recentWinner.characterWin){
        claimRandomCharacter(recentWinner);
    }
    recentWinner.characterWin = false;

    $('.win').addClass('hidden');
    $('.roll').removeClass('hidden');
    updateGameArea();
}

function updateGameArea(){
    game.clear();
    drawOwners();
    $.each(slots, function(index, slot){
        slot.justWon = false;
    });
    $.each(players, function(index, player){
        player.update();
    });
    if (currentlyAnimating){
        window.requestAnimationFrame(updateGameArea);
    } else {
        $('#roll_dice').removeClass('hidden');
    }
}