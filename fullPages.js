/*
* FullPages 1.0
*
*/

(function($) {
	"use strict";

	/*说明:获取浏览器前缀*/
	/*实现：判断某个元素的css样式中是否存在transition属性*/
	/*参数：dom元素*/
	/*返回值：boolean，有则返回浏览器样式前缀，否则返回false*/
	var _prefix = (function(tmp) {
		var aPrefix = ["webkit", "Moz", "o", "ms"],
			props = "";
		for (var i in aPrefix) {
			props = aPrefix[i] + "Transtion";
			if(tmp.style[props] !== undefined) {
				return "-" + aPrefix[i].toLowerCase() + "-";
			}
		}
		return false;
	})(document.createElement(FullPages));

	var FullPages = (function() {
		function FullPages(element, options) {
			this.settings = $.extend(true, $.fn.FullPages.defaults, options||{});
			this.element = element;
			this.init();
		}

		FullPages.prototype = {
			/* 初始化插件 */
			/* 初始化dom结构，布局，分页及绑定事件 */
			init: function() {
				var me = this;
				me.selectors = me.settings.selectors;
				me.sections = me.element.find(me.selectors.sections);
				me.section = me.sections.find(me.selectors.section);

				me.direction = me.settings.direction == "vertical" ? true : false;
				me.pagesCount = me.pagesCount();
				me.index = (me.settings.index >= 0 && me.settings.index < me.pagesCount) ? me.settings.index : 0;

				me.canscroll = true;

				if(!me.direction || me.index) {
					me._initLayout();
				}

				if(me.settings.pagination) {
					me._initPaging();
				}

				me._initEvent();
			},

			/* 获取h滑动页面数量 */
			pagesCount: function() {
				return this.section.length;
			},

			/* 获取滑动的宽度（横屏滑动）或高度（竖屏滑动）*/
			slideLength: function() {
				return this.direction == 1 ? this.element.height() : this.element.width();
			},

			/* 上一页 */
			prev: function() {
				var me = this;
				if(me.index > 0) {
					me.index --;
				}else if(me.settings.loop) {
					me.index = me.pagesCount - 1;
				}
				me._scrollPage();
			},

			/* 下一页 */
			next: function() {
				var me = this;
				if(me.index < me.pagesCount) {
					me.index ++;
				}else if(me.settings.loop) {
					me.index = 0;
				}
				me._scrollPage();
			},

			/* 针对横屏情况进行页面布局*/
			_initLayout: function() {
				var me = this;
				if(!me.direction) {
					var width = (me.pagesCount * 100) +"%",
						cellWidth = (100 / me.pagesCount).toFixed(2) + "%";
					me.sections.width(width);
					me.section.width(cellWidth).css("float", "left");
				}
				if(me.index) {
					me._scrollPage(true);
				}
			},

			/* 分页按钮布局 */
			_initPaging: function() {
				var me = this,
					pagesClass = me.selectors.page.substring(1);
				me.activeClass = me.selectors.active.substring(1);

				var pageHtml = "<ul class="+pagesClass+">";
				for(var i = 0; i < me.pagesCount; i++) {
					pageHtml += "<li></li>";
				}
				pageHtml += "</ul>";
				me.element.append(pageHtml);
				var pages = me.element.find(me.selectors.page);
				me.pageItem = pages.find("li");
				me.pageItem.eq(me.index).addClass(me.activeClass);

				if(me.direction) {
					pages.addClass("vertical");
				}else {
					pages.addClass("horizontal");
				}
			},

			/* 初始化插件事件*/
			_initEvent: function() {
				var me = this;
				/* 绑定鼠标滚轮事件 */
				me.element.on("mousewheel DOMMouseScroll", function(e) {
					e.preventDefault();
					var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
					if(me.canscroll) {
						if(delta > 0 && (me.index && !me.settings.loop || me.settings.loop)) {
							me.prev();
						}else if(delta < 0 && (me.index < (me.pagesCount-1) && !me.settings.loop || me.settings.loop)) {
							me.next();
						}
					}
				});

				/*绑定分页click事件*/
				me.element.on("click", me.selectors.page + " li", function(){
					me.index = $(this).index();
					me._scrollPage();
				});

				if(me.settings.keyboard){
					$(window).keydown(function(e){
						var keyCode = e.keyCode;
						if(keyCode == 37 || keyCode == 38){
							me.prve();
						}else if(keyCode == 39 || keyCode == 40){
							me.next();
						}
					});
				}

				/* 绑定窗口改变事件，为了不频繁调用resize的回调方法，做了延迟 */
				var resizeId;
				$(window).resize(function() {
					clearTimeout(resizeId);
					resizeId = setTimeout(function() {
						var currentLength = me.slideLength();
						var offset = me.settings.direction ? me.section.eq(me.index).offset().top : me.section.eq(me.index).offset().left;
						if(Math.abs(offset) > currentLength / 2 && me.index < (me.pagesCount - 1)) {
							me.index ++;
						}
						if(me.index) {
							me._scrollPage();
						}
					},500);
				});

				/*支持CSS3动画的浏览器，绑定transitionend事件(即在动画结束后调用起回调函数)*/
				if(_prefix){
					me.sections.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend", function(){
						me.canscroll = true;
						if(me.settings.callback && $.type(me.settings.callback) === "function"){
							me.settings.callback();
						}
					})
				}
			},

			/* 滑动动画 */
			_scrollPage: function(init) {
				var me = this;
				var dest = me.section.eq(me.index).position();
				if(!dest) return;

				me.canscroll = false;
				if(_prefix) {
					var translate = me.direction ? "translateY(-" + dest.top + "px)" :"translateX(-" + dest.left + "px)";
					me.sections.css(_prefix + "transtion", "all " + me.settings.duration + "ms " + me.settings.easing);
					me.sections.css(_prefix + "transform", translate);
				}else {
					var animateCss = me.direction ? {top : -dest.top} : {left : -dest.left};
					me.sections.animate(animateCss, me.sections.duration, function() {
						me.canscroll = true;
						if(me.settings.callback) {
							me.settings.callback();
						}
					});
				}
				if(me.settings.pagination && !init) {
					me.pageItem.eq(me.index).addClass(me.activeClass).siblings("li").removeClass(me.activeClass);
				}
			}

		};
		return FullPages;
	})();

	$.fn.FullPages = function(options) {
		return this.each(function() {
			var me = $(this),
				instance = me.data("FullPages");

			if(!instance) {
				me.data("FullPages", (instance = new FullPages(me, options)));
			}

			if($.type(options) === "string") return instance[options](); 
		});
	};

	$.fn.FullPages.defaults = {
		selectors: {
			sections: ".sections",
			section: ".section",
			page: ".pages",
			active: ".active",
		},
		index: 0,                // 页面开始的索引
		easing: "ease",          // 动画效果
		duration: 500,           // 动画执行时间
		loop: false,             // 是否循环切换
		pagination: true,        // 是否进行分页
		keyboard: true,          // 是否触发键盘事件
		direction: "vertical",   // 滑动方向vertical,horizontal
		callback: ""             // 回调函数
	};

	$(function() {
		$('[data-FullPages]').FullPages();
	});
})(jQuery);
