jquery(function($){
    //颜色选择器
    var colors = ["ffffff", "ffccc9", "ffce93", "fffc9e", "ffffc7", "9aff99", "96fffb", "cdffff", "cbcefb", "cfcfcf", "fd6864", "fe996b", "fffe65", "fcff2f", "67fd9a", "38fff8", "68fdff", "9698ed", "c0c0c0", "fe0000", "f8a102", "ffcc67", "f8ff00", "34ff34", "68cbd0", "34cdf9", "6665cd", "9b9b9b", "cb0000", "f56b00", "ffcb2f", "ffc702", "32cb00", "00d2cb", "3166ff", "6434fc", "656565", "9a0000", "ce6301", "cd9934", "999903", "009901", "329a9d", "3531ff", "6200c9", "343434", "680100", "963400", "986536", "646809", "036400", "34696d", "00009b", "303498", "000000", "330001", "643403", "663234", "343300", "013300", "003532", "010066", "340096"];

    for(var i = 0 ;i<colors.length ;i++){
	jquery('.mergepannel-props-color-selecter').append(
	    '<div class="color-selecter-cell" style="background-color:#'+colors[i]+'" color="'+colors[i]+'"></div>'
	);
    }

    jquery('input[colorselecter]').focusout(function(){
	var that = this;
	setTimeout( timeout , 100);
	function timeout(){
	    $(that).next('.mergepannel-props-color-selecter').hide();
	}
    });

    jquery('.mergepannel-props-color-selecter .color-selecter-cell').click(function(){
	var color ='#'+ $(this).attr('color');
	$(this).parent().prev('input[colorselecter]').val(color).css('background' , color).change();
	$(this).parent().hide();
    });
    
    if(jquery('#mergepannel-props-background-color').val() != ''){
	jquery('#mergepannel-props-background-color').css('background-color' , jquery('#mergepannel-props-background-color').val());
    }
    
    jquery('input[colorselecter]').change(function(){
	if(jquery(this).val() == ''){
	    jquery(this).css('background-color' ,'');
	}
    });
    jquery('input[colorselecter]').focusin(function(){
	var colorInput = $(this);
	$(this).next('.mergepannel-props-color-selecter').show().css({
	    top:colorInput.position().top+$(this).outerHeight(true)
	    ,left:colorInput.position().left
	});
    });

});



