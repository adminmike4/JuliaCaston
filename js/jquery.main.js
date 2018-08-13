// page init
document.documentElement.className += ' notload';
jQuery(window).load(function(){
	jQuery('html').removeClass('notload');
});

jQuery(function(){
	Page.init({
		animSpeed: jQuery.browser.msie && jQuery.browser.version < 9 ? 0 : 500
	});
	jcf.customForms.replaceAll();
	initHideArrow();
});

var Page = (function($) {
	var Page = {
		defaultOptions: {
			animSpeed: 500,
			activeClass: 'open-state'
		},
		init: function(options) {
			this.options = $.extend(this.defaultOptions, options);
			this.findElements();
			this.preLoadPage();
		},
		findElements: function() {
			this.elements = {};
			
			this.elements.html = $('html');
			this.elements.win = $(window);
			
			this.elements.logo = $('#logo');
			this.elements.nav = $('#nav');
			this.elements.itemFolio = $('#page-folio');
			this.elements.itemContact = $('#page-contact');
			this.elements.itemResume = $('#page-resume');
			this.elements.itemResumeLeftShoe = this.elements.itemResume.find('.shoe-left-wrapper');
			this.elements.itemResumeRightShoe = this.elements.itemResume.find('.shoe-right-wrapper');
			
			this.elements.items = this.elements.itemFolio.add(this.elements.itemContact).add(this.elements.itemResume);
			
			this.elements.visualSections = this.elements.itemFolio.find('> .visual').add(this.elements.itemContact.find('> .visual')).add(this.elements.itemResume.find('> .visual'));
			
			this.activeSection = null;
			
			this.folio = new FolioBlock({
				holder: this.elements.itemFolio.find('.gallery-holder')
			});
		},
		preLoadPage: function() {
			var self = this;
			self.elements.nav.find('> li').css('opacity', 0);
			self.elements.logo.css('opacity', 0);
			self.elements.itemFolio.css('top', -500);
			self.elements.itemContact.css('top', 500);
			self.elements.itemResumeLeftShoe.css('top', 500);
			self.elements.itemResumeRightShoe.css('top', 500);
			
			self.elements.win.load(function() {
				self.elements.logo.animate({opacity: 1}, {duration: self.options.animSpeed * 5, queue: false});
				self.elements.itemFolio.animate({top: 0}, {duration: self.options.animSpeed});
				self.elements.itemContact.delay(self.options.animSpeed).animate({top: 0}, {duration: self.options.animSpeed});
				self.elements.itemResumeLeftShoe.delay(self.options.animSpeed + 100).animate({top: 0}, {duration: self.options.animSpeed});
				self.elements.itemResumeRightShoe.delay(self.options.animSpeed + 200).animate({top: 0}, {duration: self.options.animSpeed});
				self.elements.nav.find('> li').each(function(i) {
					$(this).delay((2 + i / 2) * self.options.animSpeed).animate({opacity: 1}, {duration: self.options.animSpeed / 2});
				});
				self.addEvents();
			});
		},
		addEvents: function() {
			var self = this;
			
			self.elements.logo.mouseenter(function() {
				self.elements.logo.animate({
					opacity: 0.55
				}, {
					queue: false
				});
			}).mouseleave(function() {
				self.elements.logo.animate({
					opacity: 1
				}, {
					queue: false
				});
			});
			
			self.elements.visualSections.touchHover();
			self.elements.visualSections.each(function() {
				var holder = jQuery(this);
				var resizeBlocks = holder.hasClass('shoes') ? holder.find('.shoe-left, .shoe-right') : holder;
				var holderHeight = holder.height();
				var holderWidth = holder.width();
				var animSpeed = 200;
				var size = 1.05;
				
				resizeBlocks.each(function() {
					var block = jQuery(this);
					block.data('origWidth', block.width());
					block.data('origHeight', block.height());
					block.data('hoverWidth', block.width() * size);
					block.data('hoverHeight', block.height() * size);
					
					block.css({
						width: block.data('origWidth'),
						height: block.data('origHeight')
					});
				});
				
				holder.bind('touchstart mouseover' , function(){
					if (!holder.closest('.page-item').hasClass(self.options.activeClass)) {
						resizeBlocks.stop().each(function(){
							var block = jQuery(this);
							block.animate({
								width: block.data('hoverWidth'),
								height: block.data('hoverHeight')
							}, animSpeed);
						});
					}
				});
				holder.bind('touchend mouseout', function(){
					if (!holder.closest('.page-item').hasClass(self.options.activeClass)) {
						resizeBlocks.stop().each(function(){
							var block = jQuery(this);
							block.animate({
								width: block.data('origWidth'),
								height: block.data('origHeight')
							}, animSpeed);
						});
					}
				});
			});
			
			jQuery('#nav a').each(function() {
				var tabLink = jQuery(this),
					tabBlock = jQuery('div[title="' + tabLink.attr('title') + '"]');
				
				tabLink.removeAttr('title');
				tabBlock.removeAttr('title');
				
				tabLink.bind('mouseover' , function(){
					tabBlock.trigger('mouseover');
				});
				tabLink.bind('mouseout', function(){
					tabBlock.trigger('mouseout');
				});
				
				tabLink.add(tabBlock.closest('.visual')).bind('click', function(e) {
					e.preventDefault();
					self.switchToSection(tabBlock.closest(self.elements.items), tabLink);
				});
			});
			
			$(document).click(function(e) {
				if (!self.animated && self.activeSection) {
					if (!$(e.target).closest(self.elements.items.children()).length && !$(e.target).closest(self.elements.nav).length) {
						self.elements.nav.find('a').eq(0).trigger('click');
					}
				}
			});
		},
		switchToSection: function(section, tabLink) {
			var self = this;
			if (tabLink.parent().hasClass('active')) {
				return;
			}
			if (!self.animated) {
				self.animated = true;
				
				self.elements.nav.find('> li').removeClass('active');
				tabLink.closest('li').addClass('active');
				
				if (!section.length) {
					if (self.activeSection) {
						var visual1 = self.elements.itemFolio.find('> .visual');
						var visual2 = self.elements.itemContact.find('> .visual');
						var visual3 = self.elements.itemResume.find('> .visual');
						var items = self.elements.itemResume.find('> .visual .shoe-left, > .visual .shoe-right');
						
						if (self.activeSection.is(self.elements.itemFolio)) {
							self.folio.hideGallery();
							visual1.animate({
								width: visual1.data('origWidth'),
								height: visual1.data('origHeight')
							}, {
								duration: self.options.animSpeed,
								complete: function() {
									self.elements.itemFolio.removeClass(self.options.activeClass);
									self.elements.itemContact.removeClass(self.options.activeClass);
									self.elements.itemResume.removeClass(self.options.activeClass);
								}
							});
							
							self.elements.itemContact.css({
								opacity: 0,
								top: 380,
								visibility: ''
							}).animate({
								opacity: 1,
								top: 0
							}, {
								duration: self.options.animSpeed
							});
							self.elements.itemContact.find('.boxes').hide();
							visual2.css({
								opacity: '',
								top: 0,
								width: visual2.data('origWidth') * 2.6,
								height: visual2.data('origHeight') * 2.6
							}).animate({
								width: visual2.data('origWidth'),
								height: visual2.data('origHeight')
							}, {
								duration: self.options.animSpeed
							});
							
							self.elements.itemResume.css({
								top: 380,
								opacity: 0,
								visibility: ''
							}).animate({
								top: 0,
								opacity: 1
							}, {
								duration: self.options.animSpeed
							});
							items.each(function() {
								var item = $(this);
								item.css({
									width: item.data('origWidth') * 2,
									height: item.data('origHeight') * 2
								}).animate({
									width: item.data('origWidth'),
									height: item.data('origHeight')
								}, {
									duration: self.options.animSpeed
								});
							});
							visual3.css({
								top: 0,
								width: 420,
								height: 245
							}).animate({
								width: 212,
								height: 126
							}, {
								duration: self.options.animSpeed
							});
							self.elements.itemResume.find('.page-content').css({
								position: 'absolute',
								top: -32700,
								left: -32700
							});
						}
						
						if (self.activeSection.is(self.elements.itemContact)) {
							self.elements.itemFolio.css({
								opacity: 0,
								top: -600,
								visibility: ''
							}).animate({
								top: 0,
								opacity: 1
							}, {
								duration: self.options.animSpeed
							});
							visual1.css({
								width: visual1.data('origWidth') * 2,
								height: visual1.data('origHeight') * 2
							}).animate({
								width: visual1.data('origWidth'),
								height: visual1.data('origHeight')
							}, {
								duration: self.options.animSpeed
							});
							
							self.elements.itemContact.animate({
								top: 0
							}, {
								duration: self.options.animSpeed,
								complete: function() {
									self.elements.itemFolio.removeClass(self.options.activeClass);
									self.elements.itemContact.removeClass(self.options.activeClass);
									self.elements.itemResume.removeClass(self.options.activeClass);
								}
							});
							self.elements.itemContact.find('.boxes').hide();
							visual2.css('opacity', '').animate({
								top: 0,
								width: visual2.data('origWidth'),
								height: visual2.data('origHeight')
							}, {
								duration: self.options.animSpeed
							});
							
							self.elements.itemResume.css({
								top: 300,
								opacity: 0,
								visibility: ''
							}).animate({
								top: 0,
								opacity: 1
							}, {
								duration: self.options.animSpeed
							});
							items.each(function() {
								var item = $(this);
								item.css({
									width: item.data('origWidth') * 2,
									height: item.data('origHeight') * 2
								}).animate({
									width: item.data('origWidth'),
									height: item.data('origHeight')
								}, {
									duration: self.options.animSpeed
								});
							});
							visual3.css({
								top: 0,
								width: 420,
								height: 245
							}).animate({
								width: 212,
								height: 126
							}, {
								duration: self.options.animSpeed
							});
							self.elements.itemResume.find('.page-content').css({
								position: 'absolute',
								top: -32700,
								left: -32700
							});
						}
						
						if (self.activeSection.is(self.elements.itemResume)) {
							self.elements.itemFolio.css({
								opacity: 0,
								top: -1200,
								visibility: ''
							}).animate({
								top: 0,
								opacity: 1
							}, {
								duration: self.options.animSpeed
							});
							visual1.css({
								width: visual1.data('origWidth') * 2,
								height: visual1.data('origHeight') * 2
							}).animate({
								width: visual1.data('origWidth'),
								height: visual1.data('origHeight')
							}, {
								duration: self.options.animSpeed
							});
							
							self.elements.itemContact.css({
								opacity: 0,
								top: -1200,
								visibility: ''
							}).animate({
								opacity: 1,
								top: 0
							}, {
								duration: self.options.animSpeed
							});
							self.elements.itemContact.find('.boxes').hide();
							visual2.css({
								opacity: '',
								top: 0,
								width: visual2.data('origWidth') * 2.6,
								height: visual2.data('origHeight') * 2.6
							}).animate({
								width: visual2.data('origWidth'),
								height: visual2.data('origHeight')
							}, {
								duration: self.options.animSpeed
							});
							
							self.elements.itemResume.animate({
								top: 0,
								opacity: 1
							}, {
								duration: self.options.animSpeed,
								complete: function() {
									self.elements.itemFolio.removeClass(self.options.activeClass);
									self.elements.itemContact.removeClass(self.options.activeClass);
									self.elements.itemResume.removeClass(self.options.activeClass);
								}
							});
							items.each(function() {
								var item = $(this);
								item.animate({
									width: item.data('origWidth'),
									height: item.data('origHeight')
								}, {
									duration: self.options.animSpeed
								});
							});
							visual3.animate({
								top: 0,
								width: 212,
								height: 126
							}, {
								duration: self.options.animSpeed
							});
							self.elements.itemResume.find('.page-content').css({
								position: 'absolute',
								top: -32700,
								left: -32700
							});
						}
						self.animated = false;
						self.activeSection = null;
						return;
					} else {
						self.animated = false;
						self.activeSection = null;
					}
				}
				
				var visual = section.find('> .visual');
				section.addClass(self.options.activeClass);
				
				// itemFolio
				if (section.is(self.elements.itemFolio)) {
					var size = 2;
					if (self.activeSection) {
						var oldSection = self.activeSection;
						if (oldSection.is(self.elements.itemContact)) {
							var oldVisual = oldSection.find('> .visual');
							oldSection.animate({
								top: '+=20px'
							}, {
								duration: self.options.animSpeed / 3
							});
							oldVisual.animate({
								width: oldVisual.data('origWidth') * 1.8,
								height: oldVisual.data('origHeight') * 1.8
							}, {
								duration: self.options.animSpeed / 3
							});
							oldSection.find('.boxes').animate({
								opacity: 0
							}, {
								duration: 50
							});
							setTimeout(function() {
								oldSection.animate({
									top: 1500
								}, {
									duration: self.options.animSpeed,
									complete: function() {
										$(this).css('visibility', 'hidden');
									}
								});
								oldSection.find('> .visual').animate({
									opacity: 0
								}, {
									duration: self.options.animSpeed
								});
								oldSection.find('.boxes').animate({
									opacity: 0
								}, {
									duration: self.options.animSpeed
								});
							}, self.options.animSpeed / 3);
						}
						if (oldSection.is(self.elements.itemResume)) {
							var items = oldSection.find('> .visual .shoe-left-wrapper, > .visual .shoe-right-wrapper');
							items.each(function() {
								var item = $(this);
								item.animate({
									top: '-=20px'
								}, {
									duration: self.options.animSpeed / 3
								});
								setTimeout(function() {
									item.stop().animate({
										top: '+=20px'
									}, {
										duration: self.options.animSpeed / 3,
										complete: function() {
											$(this).css('top', '');
										}
									});
								}, self.options.animSpeed / 6);
								oldSection.find('.page-content').animate({
									opacity: 0
								}, {
									duration: self.options.animSpeed / 3
								});
								setTimeout(function() {
									oldSection.animate({
										top: 1700,
										opacity: 0
									}, {
										duration: self.options.animSpeed,
										complete: function() {
											$(this).css('visibility', 'hidden');
										}
									});
								}, self.options.animSpeed / 3);
							});
						}
						setTimeout(function() {
							self.elements.itemContact.find('.visual').css({
								width: 574,
								height: 707,
								opacity: '',
								visibility: ''
							});
							self.elements.itemContact.css({
								top: -1500,
								opacity: '',
								visibility: ''
							}).animate({
								top: 1000
							}, {
								duration: self.options.animSpeed,
								complete: function() {
									self.elements.itemContact.css({
										opacity: 0,
										visibility: 'hidden'
									});
								}
							});
							
							section.css({
								visibility: '',
								top: -2200
							}).stop().animate({
								top: 0,
								opacity: 1
							}, {
								duration: self.options.animSpeed,
								complete: function() {
									$(this).css('opacity', '');
									self.animated = false;
									self.folio.showGallery();
								}
							});
							visual.css({
								width: visual.data('origWidth') * size,
								height: visual.data('origHeight') * size
							});
						}, self.options.animSpeed / 3);
					} else {
						visual.animate({
							width: visual.data('origWidth'),
							height: visual.data('origHeight')
						}, {
							duration: self.options.animSpeed / 3
						});
						
						self.elements.itemContact.animate({
							top: -10
						}, {
							duration: self.options.animSpeed / 3
						});
						self.elements.itemResume.animate({
							top: -10
						}, {
							duration: self.options.animSpeed / 3
						});
						setTimeout(function() {
							visual.animate({
								width: visual.data('origWidth') * size,
								height: visual.data('origHeight') * size
							}, {
								duration: self.options.animSpeed,
								complete: function() {
									self.animated = false;
									self.folio.showGallery()
								}
							});
							
							self.elements.itemContact.animate({
								top: 500,
								opacity: 0
							}, {
								duration: self.options.animSpeed,
								complete: function() {
									$(this).css('visibility', 'hidden');
								}
							});
							self.elements.itemResume.animate({
								top: 500,
								opacity: 0
							}, {
								duration: self.options.animSpeed,
								complete: function() {
									$(this).css('visibility', 'hidden');
								}
							});
						}, self.options.animSpeed / 3);
					}
					self.activeSection = section;
				}
				
				// itemContact
				if (section.is(self.elements.itemContact)) {
					var size = 2.6;
					if (self.activeSection) {
						var oldSection = self.activeSection;
						if (oldSection.is(self.elements.itemFolio)) {
							self.folio.hideGallery();
							section.css('top', 1500);
							var oldVisual = oldSection.find('> .visual');
							oldSection.animate({
								top: -500,
								opacity: 0
							}, {
								duration: self.options.animSpeed,
								complete: function() {
									$(this).css('visibility', 'hidden');
								}
							});
						}
						if (oldSection.is(self.elements.itemResume)) {
							var items = oldSection.find('> .visual .shoe-left-wrapper, > .visual .shoe-right-wrapper');
							section.css('top', -1000);
							items.each(function() {
								var item = $(this);
								item.animate({
									top: '-=20px'
								}, {
									duration: self.options.animSpeed / 3
								});
								setTimeout(function() {
									item.stop().animate({
										top: '+=20px'
									}, {
										duration: self.options.animSpeed / 3,
										complete: function() {
											$(this).css('top', '');
										}
									});
								}, self.options.animSpeed / 6);
								oldSection.find('.page-content').animate({
									opacity: 0
								}, {
									duration: self.options.animSpeed / 3
								});
								setTimeout(function() {
									oldSection.animate({
										top: 1000,
										opacity: 0
									}, {
										duration: self.options.animSpeed,
										complete: function() {
											$(this).css('visibility', 'hidden');
										}
									});
								}, self.options.animSpeed / 3);
							});
						}
						setTimeout(function() {
							visual.css({
								width: visual.data('origWidth') * size,
								height: visual.data('origHeight') * size,
								top: -345,
								opacity: ''
							});
							section.css('visibility', '').stop().animate({
								top: 0,
								opacity: 1
							}, {
								duration: self.options.animSpeed,
								complete: function() {
									self.animated = false;
								}
							});
							setTimeout(function() {
								section.find('.boxes').css({
									display: 'block',
									visibility: '',
									opacity: 0
								}).animate({
									opacity: 1
								});
							}, self.options.animSpeed)
						}, self.options.animSpeed / 3);
					} else {
						visual.animate({
							width: visual.data('origWidth'),
							height: visual.data('origHeight')
						}, {
							duration: self.options.animSpeed / 3
						});
						
						self.elements.itemFolio.animate({
							top: 10
						}, {
							duration: self.options.animSpeed / 3
						});
						self.elements.itemResume.animate({
							top: -10
						}, {
							duration: self.options.animSpeed / 3
						});
						setTimeout(function() {
							visual.animate({
								width: visual.data('origWidth') * size,
								height: visual.data('origHeight') * size,
								top: -345
							}, {
								duration: self.options.animSpeed,
								complete: function() {
									section.find('.boxes').css({
										display: 'none',
										opacity: ''
									}).fadeIn();
									self.animated = false;
								}
							});
							
							self.elements.itemFolio.animate({
								top: -500,
								opacity: 0
							}, {
								duration: self.options.animSpeed,
								complete: function() {
									$(this).css('visibility', 'hidden');
								}
							});
							self.elements.itemResume.animate({
								top: 500,
								opacity: 0
							}, {
								duration: self.options.animSpeed,
								complete: function() {
									$(this).css('visibility', 'hidden');
								}
							});
						}, self.options.animSpeed / 3);
					}
					self.activeSection = section;
				}
				
				// itemResume
				if (section.is(self.elements.itemResume)) {
					var size = 2;
					var items = section.find('> .visual .shoe-left, > .visual .shoe-right');
					if (self.activeSection) {
						var oldSection = self.activeSection;
						if (oldSection.is(self.elements.itemFolio)) {
							self.folio.hideGallery();
							oldSection.animate({
								top: '+=20px'
							}, {
								duration: self.options.animSpeed / 3
							});
							setTimeout(function() {
								self.elements.itemContact.find('.visual').css({
									width: 574,
									height: 707,
									opacity: '',
									visibility: ''
								});
								self.elements.itemContact.css({
									top: 1000,
									opacity: '',
									visibility: ''
								}).animate({
									top: -1500
								}, {
									duration: self.options.animSpeed,
									complete: function() {
										self.elements.itemContact.css({
											opacity: 0,
											visibility: 'hidden'
										});
									}
								});
								
								
								oldSection.stop().animate({
									top: -1500,
									opacity: 0
								}, {
									duration: self.options.animSpeed,
									complete: function() {
										$(this).css('visibility', 'hidden');
									}
								});
							}, self.options.animSpeed / 3);
						}
						if (oldSection.is(self.elements.itemContact)) {
							var oldVisual = oldSection.find('> .visual');
							oldSection.animate({
								top: '+=20px'
							}, {
								duration: self.options.animSpeed / 3
							});
							oldVisual.animate({
								width: oldVisual.data('origWidth') * 1.8,
								height: oldVisual.data('origHeight') * 1.8
							}, {
								duration: self.options.animSpeed / 3
							});
							oldSection.find('.boxes').animate({
								opacity: 0
							}, {
								duration: 50
							});
							setTimeout(function() {
								oldSection.animate({
									top: -500
								}, {
									duration: self.options.animSpeed,
									complete: function() {
										$(this).css('visibility', 'hidden');
									}
								});
								oldSection.find('> .visual').animate({
									opacity: 0
								}, {
									duration: self.options.animSpeed
								});
								oldSection.find('.boxes').animate({
									opacity: 0
								}, {
									duration: self.options.animSpeed
								});
							}, self.options.animSpeed / 3);
						}
						setTimeout(function() {
							items.each(function() {
								var item = $(this);
								item.css({
									width: item.data('origWidth') * size,
									height: item.data('origHeight') * size
								});
							});
							section.css({
								visibility: '',
								top: 1500
							}).animate({
								top: 0,
								opacity: 1
							}, {
								duration: self.options.animSpeed,
								complete: function() {
									$(this).find('.page-content').css({
										left: 0,
										top: -634,
										position: 'relative',
										opacity: 0
									}).animate({
										opacity: 1
									}, {
										duration: self.options.animSpeed,
										complete: function() {
											$(this).css('opacity', '');
											self.animated = false;
										}
									});
								}
							});
							visual.css({
								top: -645,
								width: 420,
								height: 245
							});
						}, self.options.animSpeed / 3);
					} else {
						items.each(function() {
							var item = $(this);
							item.animate({
								width: item.data('origWidth'),
								height: item.data('origHeight')
							}, {
								duration: self.options.animSpeed / 3
							});
						});
						
						self.elements.itemFolio.animate({
							top: 10
						}, {
							duration: self.options.animSpeed / 3
						});
						self.elements.itemContact.animate({
							top: 10
						}, {
							duration: self.options.animSpeed / 3
						});
						setTimeout(function() {
							visual.animate({
								top: -645,
								width: 420,
								height: 245
							}, {
								duration: self.options.animSpeed,
								complete: function() {
									section.find('.page-content').css({
										position: 'relative',
										top: -634,
										left: 0,
										opacity: 0
									}).animate({
										opacity: 1
									});
									self.animated = false;
								}
							});
							items.each(function() {
								var item = $(this);
								item.animate({
									width: item.data('origWidth') * size,
									height: item.data('origHeight') * size
								}, {
									duration: self.options.animSpeed
								});
							});
							
							self.elements.itemFolio.animate({
								top: -1200,
								opacity: 0
							}, {
								duration: self.options.animSpeed
							});
							self.elements.itemContact.animate({
								top: -1200,
								opacity: 0
							}, {
								duration: self.options.animSpeed
							});
						}, self.options.animSpeed / 3);
					}
					self.activeSection = section;
				}
			}
		}
	}
	
	return Page;
}(jQuery));

/*
 * FolioBlock class
 */
function FolioBlock(options) {
	this.options = $.extend({
		animSpeed: $.support.opacity ? 300 : 0
	}, options);
	this.init();
}
FolioBlock.prototype = {
	init: function() {
		this.findElements();
		this.initStructure();
	},
	findElements: function() {
		this.holder = jQuery(this.options.holder);
		this.pre = this.holder.find('img.pre');
		this.decor = this.holder.find('img.decor');
		this.gallery = this.holder.find('.slideshow');
		this.slideset = this.gallery.find('.slideset');
		this.switcher = this.gallery.find('.switcher');
		this.loader1 = this.holder.find('.loading');
		
		this.galleryHide = true;
		this.firstLoad = true;
	},
	initStructure: function() {
		this.holder.css('visibility', 'hidden');
		this.slideset.css({
			opacity: 0,
			visibility: 'hidden'
		});
		this.decor.css('opacity', 0);
		this.initGallery();
	},
	initGallery: function() {
		this.gallery.mainGallery({
			slideHolder: '.slideset',
			pagerLinks: '.switcher a',
			animSpeed: 600,
			onLoad: function(that, slide) {
				slide.find('.scrollable-area').each(function() {
					new jcf.modules.customscroll({
						replaces: this
					});
					
					var area = jQuery(this);
					var f;
					var sl;
					area.mousedown(function(e) {
						if (e.which === 1) {
							e.preventDefault();
							f = e.clientX;
							sl = area.scrollLeft();
						}
					}).mousemove(function(e) {
						if (f) {
							e.preventDefault();
							area.scrollLeft(sl + (f - e.clientX));
							if (area[0].jcf) {
								area[0].jcf.refreshState();
							}
						}
					});
					
					jQuery(document).mouseup(function() {
						f = null;
					});
				});
			},
			onBeforeChange: function(that) {
				var curSlide = that.pagerLinks.eq(that.curInd).data('slide');
				
				if (curSlide) {
					var scrollBlock = curSlide.find('.scrollable-area');
					if (scrollBlock.length) {
						scrollBlock.scrollLeft(0);
						if (scrollBlock[0].jcf) {
							scrollBlock[0].jcf.refreshState();
						}
					}
				}
			}
		});
	},
	showGalleryBox: function() {
		var self = this;
		if (self.galleryHide) {
			self.galleryHide = false;
			self.switcher.css('visibility', '').animate({
				opacity: 1
			}, {
				duration: self.options.animSpeed,
				complete: function() {
					$(this).css('opacity', '');
				}
			});
			self.slideset.css('visibility', '').animate({
				opacity: 1
			}, {
				duration: self.options.animSpeed,
				complete: function() {
					$(this).css('opacity', '');
				}
			});
		}
	},
	showGallery: function() {
		var self = this;
		if (self.firstLoad) {
			self.gallery.data('MainGallery').pagerLinks.eq(0).trigger('click');
		}
		self.firstLoad = false;
		self.holder.css('visibility', '');
		self.slideset.css('opacity', 0);
		self.decor.css('opacity', 0);
		self.loader1.hide();
		self.switcher.css({
			opacity: 0,
			visibility: 'hidden',
			left: 0
		});
		self.decor.css('opacity', 0);
		self.timer = setTimeout(function() {
			self.loader1.hide().fadeIn();
			self.pre.animate({
				opacity: 0
			}, {
				duration: self.options.animSpeed,
				complete: function() {
					$(this).css('visibility', 'hidden')
				}
			});
			self.decor.css('visibility', '').animate({
				opacity: 1
			}, {
				duration: self.options.animSpeed,
				complete: function() {
					$(this).css('opacity', '');
					self.timer2 = setTimeout(function() {
						self.showGalleryBox();
					}, 1500);
				}
			});
		}, 700);
	},
	hideGallery: function() {
		var self = this;
		self.galleryHide = true;
		clearTimeout(self.timer);
		clearTimeout(self.timer2);
		self.pre.css('visibility', 'hidden');
		self.decor.css('visibility', 'hidden');
		self.holder.animate({
			opacity: 0
		}, {
			duration: $.support.opacity ? 100 : 0,
			complete: function() {
				self.slideset.css('visibility', 'hidden');
				jQuery(this).css({
					opacity: '',
					visibility: 'hidden'
				});
			}
		});
	}
}

/*
 * MainGallery
 */
;(function ($){
	function MainGallery(options) {
		this.options = {
			slideHolder: '.slideset',
			slide: '.slide',
			activeClass: 'active',
			loadingClass: 'loading-state',
			pagerLinks: '.pagination a',
			animSpeed: 600,
			minLoadDelay: 1000,
			event: 'click'
		},
		$.extend(this.options, options);
		this.init();
	}
	MainGallery.prototype = {
		init: function() {
			this.findElements();
			this.addEvents();
		},
		findElements: function() {
			this.holder = $(this.options.holder);
			this.slideHolder = this.holder.find(this.options.slideHolder);
			this.pagerLinks = this.holder.find(this.options.pagerLinks);
			
			this.curInd = 0;
			this.oldInd = 0;
			this.animated = false;
		},
		addEvents: function() {
			var that = this;
			
			that.pagerLinks.bind('click', function(e) {
				e.preventDefault();
				if (!that.animated) {
					that.oldInd = that.curInd;
					that.curInd = that.pagerLinks.index(this);
					that.switchSlide();
				}
			});
		},
		switchSlide: function() {
			var that = this;
			
			if (that.animated) {
				return;
			}
			that.animated = true;
			var oldSlide = that.pagerLinks.eq(that.oldInd).data('slide');
			var newSlide = that.pagerLinks.eq(that.curInd).data('slide');
			
			that.pagerLinks.eq(that.oldInd).removeClass(that.options.activeClass);
			that.pagerLinks.eq(that.curInd).addClass(that.options.activeClass);
			
			if (oldSlide) {
				oldSlide.removeClass(that.options.activeClass).animate({
					opacity: 0
				}, {
					duration: that.options.animSpeed
				});
			}
			if (newSlide) {
				newSlide.addClass(that.options.activeClass).animate({
					opacity: 1
				}, {
					duration: that.options.animSpeed,
					complete: function() {
						that.animated = false;
					}
				});
			} else {
				var startTime = new Date();
				that.holder.addClass(that.options.loadingClass);
				$.ajax({
					url: that.pagerLinks.eq(that.curInd).attr('href'),
					type: 'get',
					cache: false,
					dataType: 'text',
					success: function(data) {
						var newContent = $('<div>', {
							html: data
						});
						var newSlide = newContent.find(that.options.slide);
						newSlide.css('opacity', 0).appendTo(that.slideHolder);
						
						var loadTime = new Date();
						var deltaTime = loadTime - startTime;
						setTimeout(function() {
							newSlide.animate({
								opacity: 1
							}, {
								duration: that.options.animSpeed,
								complete: function() {
									that.animated = false;
									that.holder.removeClass(that.options.loadingClass);
								}
							});
						}, deltaTime > that.options.minLoadDelay ? 0 : (that.options.minLoadDelay - deltaTime));
						that.pagerLinks.eq(that.curInd).data('slide', newSlide);
						that.makeCallback('onLoad', that, newSlide);
					},
					error: function() {
						alert('AJAX Error!');
					}
				});
			}
			that.makeCallback('onBeforeChange', that);
		},
		makeCallback: function(name) {
			if(typeof this.options[name] === 'function') {
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				this.options[name].apply(this, args);
			}
		}
	}
	$.fn.mainGallery = function(options) {
		return this.each(function() {
			if (!$(this).data('MainGallery')) {
				$(this).data('MainGallery', new MainGallery($.extend({holder: this}, options)));
			}
		});
	}
}(jQuery));

// init hide arrow
function initHideArrow(){
	var bntTop = jQuery('.slideshow .switcher .vscroll-up');
	var bntBottom = jQuery('.slideshow .switcher .vscroll-down');
	if (jQuery('.slideshow .switcher ul li').length <= 13) {
		bntTop.hide();
		bntBottom.hide();
	} else {
		bntTop.show();
		bntBottom.show();
	}
}

/*
 * Custom hover plugin
 */
;(function($){
	$.fn.touchHover = function(opt) {
		var options = $.extend({
			element: null,
			hoverClass: 'hover',
			toggleEvents: isTouchDevice ? 'touchstart/touchend' : 'mouseover/mouseout',
			resetEvent: isTouchDevice ? 'touchmove' : null
		}, opt);
		
		return this.each(function() {
			// toggle functions
			var element = $(this);
			var toggleEvents = options.toggleEvents.split('index.html');
			
			var toggleOn = function() {
				element.addClass(options.hoverClass);
				element.bind(toggleEvents[1], toggleOff);
			};
			var toggleOff = function() {
				element.removeClass(options.hoverClass);
				element.unbind(toggleEvents[1], toggleOff);
			};
			
			// event handlers
			element.bind(toggleEvents[0], toggleOn);
			if(options.resetEvent) {
				element.bind(options.resetEvent, toggleOff);
			}
		});
	};

	// detect device type
	var isTouchDevice = (function() {
		try {
			return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
		} catch (e) {
			return false;
		}
	}());
}(jQuery));

/*
 * JavaScript Custom Forms Module
 */
jcf = {
	// global options
	modules: {},
	plugins: {},
	baseOptions: {
		unselectableClass:'jcf-unselectable',
		labelActiveClass:'jcf-label-active',
		labelDisabledClass:'jcf-label-disabled',
		classPrefix: 'jcf-class-',
		hiddenClass:'jcf-hidden',
		focusClass:'jcf-focus',
		wrapperTag: 'div'
	},
	// replacer function
	customForms: {
		setOptions: function(obj) {
			for(var p in obj) {
				if(obj.hasOwnProperty(p) && typeof obj[p] === 'object') {
					jcf.lib.extend(jcf.modules[p].prototype.defaultOptions, obj[p]);
				}
			}
		},
		replaceAll: function() {
			for(var k in jcf.modules) {
				var els = jcf.lib.queryBySelector(jcf.modules[k].prototype.selector);
				for(var i = 0; i<els.length; i++) {
					if(els[i].jcf) {
						// refresh form element state
						els[i].jcf.refreshState();
					} else {
						// replace form element
						if(!jcf.lib.hasClass(els[i], 'default') && jcf.modules[k].prototype.checkElement(els[i])) {
							new jcf.modules[k]({
								replaces:els[i]
							});
						}
					}
				}
			}
		},
		refreshAll: function() {
			for(var k in jcf.modules) {
				var els = jcf.lib.queryBySelector(jcf.modules[k].prototype.selector);
				for(var i = 0; i<els.length; i++) {
					if(els[i].jcf) {
						// refresh form element state
						els[i].jcf.refreshState();
					}
				}
			}
		},
		refreshElement: function(obj) {
			if(obj && obj.jcf) {
				obj.jcf.refreshState();
			}
		},
		destroyAll: function() {
			for(var k in jcf.modules) {
				var els = jcf.lib.queryBySelector(jcf.modules[k].prototype.selector);
				for(var i = 0; i<els.length; i++) {
					if(els[i].jcf) {
						els[i].jcf.destroy();
					}
				}
			}
		}
	},
	// detect device type
	isTouchDevice: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
	isWinPhoneDevice: navigator.msPointerEnabled && /MSIE 10.*Touch/.test(navigator.userAgent),
	// define base module
	setBaseModule: function(obj) {
		jcf.customControl = function(opt){
			this.options = jcf.lib.extend({}, jcf.baseOptions, this.defaultOptions, opt);
			this.init();
		};
		for(var p in obj) {
			jcf.customControl.prototype[p] = obj[p];
		}
	},
	// add module to jcf.modules
	addModule: function(obj) {
		if(obj.name){
			// create new module proto class
			jcf.modules[obj.name] = function(){
				jcf.modules[obj.name].superclass.constructor.apply(this, arguments);
			};
			jcf.lib.inherit(jcf.modules[obj.name], jcf.customControl);
			for(var p in obj) {
				jcf.modules[obj.name].prototype[p] = obj[p];
			}
			// on create module
			jcf.modules[obj.name].prototype.onCreateModule();
			// make callback for exciting modules
			for(var mod in jcf.modules) {
				if(jcf.modules[mod] != jcf.modules[obj.name]) {
					jcf.modules[mod].prototype.onModuleAdded(jcf.modules[obj.name]);
				}
			}
		}
	},
	// add plugin to jcf.plugins
	addPlugin: function(obj) {
		if(obj && obj.name) {
			jcf.plugins[obj.name] = function() {
				this.init.apply(this, arguments);
			};
			for(var p in obj) {
				jcf.plugins[obj.name].prototype[p] = obj[p];
			}
		}
	},
	// miscellaneous init
	init: function(){
		if(navigator.msPointerEnabled) {
			this.eventPress = 'MSPointerDown';
			this.eventMove = 'MSPointerMove';
			this.eventRelease = 'MSPointerUp';
		} else {
			this.eventPress = this.isTouchDevice ? 'touchstart' : 'mousedown';
			this.eventMove = this.isTouchDevice ? 'touchmove' : 'mousemove';
			this.eventRelease = this.isTouchDevice ? 'touchend' : 'mouseup';
		}

		// init jcf styles
		setTimeout(function(){
			jcf.lib.domReady(function(){
				jcf.initStyles();
			});
		},1);
		return this;
	},
	initStyles: function() {
		// create <style> element and rules
		var head = document.getElementsByTagName('head')[0],
			style = document.createElement('style'),
			rules = document.createTextNode('.'+jcf.baseOptions.unselectableClass+'{'+
				'-moz-user-select:none;'+
				'-webkit-tap-highlight-color:rgba(255,255,255,0);'+
				'-webkit-user-select:none;'+
				'user-select:none;'+
			'}');
		
		// append style element
		style.type = 'text/css';
		if(style.styleSheet) {
			style.styleSheet.cssText = rules.nodeValue;
		} else {
			style.appendChild(rules);
		}
		head.appendChild(style);
	}
}.init();

/*
 * Custom Form Control prototype
 */
jcf.setBaseModule({
	init: function(){
		if(this.options.replaces) {
			this.realElement = this.options.replaces;
			this.realElement.jcf = this;
			this.replaceObject();
		}
	},
	defaultOptions: {
		// default module options (will be merged with base options)
	},
	checkElement: function(el){
		return true; // additional check for correct form element
	},
	replaceObject: function(){
		this.createWrapper();
		this.attachEvents();
		this.fixStyles();
		this.setupWrapper();
	},
	createWrapper: function(){
		this.fakeElement = jcf.lib.createElement(this.options.wrapperTag);
		this.labelFor = jcf.lib.getLabelFor(this.realElement);
		jcf.lib.disableTextSelection(this.fakeElement);
		jcf.lib.addClass(this.fakeElement, jcf.lib.getAllClasses(this.realElement.className, this.options.classPrefix));
		jcf.lib.addClass(this.realElement, jcf.baseOptions.hiddenClass);
	},
	attachEvents: function(){
		jcf.lib.event.add(this.realElement, 'focus', this.onFocusHandler, this);
		jcf.lib.event.add(this.realElement, 'blur', this.onBlurHandler, this);
		jcf.lib.event.add(this.fakeElement, 'click', this.onFakeClick, this);
		jcf.lib.event.add(this.fakeElement, jcf.eventPress, this.onFakePressed, this);
		jcf.lib.event.add(this.fakeElement, jcf.eventRelease, this.onFakeReleased, this);

		if(this.labelFor) {
			this.labelFor.jcf = this;
			jcf.lib.event.add(this.labelFor, 'click', this.onFakeClick, this);
			jcf.lib.event.add(this.labelFor, jcf.eventPress, this.onFakePressed, this);
			jcf.lib.event.add(this.labelFor, jcf.eventRelease, this.onFakeReleased, this);
		}
	},
	fixStyles: function() {
		// hide mobile webkit tap effect
		if(jcf.isTouchDevice) {
			var tapStyle = 'rgba(255,255,255,0)';
			this.realElement.style.webkitTapHighlightColor = tapStyle;
			this.fakeElement.style.webkitTapHighlightColor = tapStyle;
			if(this.labelFor) {
				this.labelFor.style.webkitTapHighlightColor = tapStyle;
			}
		}
	},
	setupWrapper: function(){
		// implement in subclass
	},
	refreshState: function(){
		// implement in subclass
	},
	destroy: function() {
		if(this.fakeElement && this.fakeElement.parentNode) {
			this.fakeElement.parentNode.removeChild(this.fakeElement);
		}
		jcf.lib.removeClass(this.realElement, jcf.baseOptions.hiddenClass);
		this.realElement.jcf = null;
	},
	onFocus: function(){
		// emulated focus event
		jcf.lib.addClass(this.fakeElement,this.options.focusClass);
	},
	onBlur: function(cb){
		// emulated blur event
		jcf.lib.removeClass(this.fakeElement,this.options.focusClass);
	},
	onFocusHandler: function() {
		// handle focus loses
		if(this.focused) return;
		this.focused = true;
		
		// handle touch devices also
		if(jcf.isTouchDevice) {
			if(jcf.focusedInstance && jcf.focusedInstance.realElement != this.realElement) {
				jcf.focusedInstance.onBlur();
				jcf.focusedInstance.realElement.blur();
			}
			jcf.focusedInstance = this;
		}
		this.onFocus.apply(this, arguments);
	},
	onBlurHandler: function() {
		// handle focus loses
		if(!this.pressedFlag) {
			this.focused = false;
			this.onBlur.apply(this, arguments);
		}
	},
	onFakeClick: function(){
		if(jcf.isTouchDevice) {
			this.onFocus();
		} else if(!this.realElement.disabled) {
			this.realElement.focus();
		}
	},
	onFakePressed: function(e){
		this.pressedFlag = true;
	},
	onFakeReleased: function(){
		this.pressedFlag = false;
	},
	onCreateModule: function(){
		// implement in subclass
	},
	onModuleAdded: function(module) {
		// implement in subclass
	},
	onControlReady: function() {
		// implement in subclass
	}
});

/*
 * JCF Utility Library
 */
jcf.lib = {
	bind: function(func, scope){
		return function() {
			return func.apply(scope, arguments);
		}
	},
	browser: (function() {
		var ua = navigator.userAgent.toLowerCase(), res = {},
		match = /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) ||
				/(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(ua) || [];
		res[match[1]] = true;
		res.version = match[2] || "0";
		res.safariMac = ua.indexOf('mac') != -1 && ua.indexOf('safari') != -1;
		return res;
	})(),
	getOffset: function (obj) {
		if (obj.getBoundingClientRect && !navigator.msPointerEnabled) {
			var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
			var clientLeft = document.documentElement.clientLeft || document.body.clientLeft || 0;
			var clientTop = document.documentElement.clientTop || document.body.clientTop || 0;
			return {
				top:Math.round(obj.getBoundingClientRect().top + scrollTop - clientTop),
				left:Math.round(obj.getBoundingClientRect().left + scrollLeft - clientLeft)
			}
		} else {
			var posLeft = 0, posTop = 0;
			while (obj.offsetParent) {posLeft += obj.offsetLeft; posTop += obj.offsetTop; obj = obj.offsetParent;}
			return {top:posTop,left:posLeft};
		}
	},
	getScrollTop: function() {
		return window.pageYOffset || document.documentElement.scrollTop;
	},
	getScrollLeft: function() {
		return window.pageXOffset || document.documentElement.scrollLeft;
	},
	getWindowWidth: function(){
		return document.compatMode=='CSS1Compat' ? document.documentElement.clientWidth : document.body.clientWidth;
	},
	getWindowHeight: function(){
		return document.compatMode=='CSS1Compat' ? document.documentElement.clientHeight : document.body.clientHeight;
	},
	getStyle: function(el, prop) {
		if (document.defaultView && document.defaultView.getComputedStyle) {
			return document.defaultView.getComputedStyle(el, null)[prop];
		} else if (el.currentStyle) {
			return el.currentStyle[prop];
		} else {
			return el.style[prop];
		}
	},
	getParent: function(obj, selector) {
		while(obj.parentNode && obj.parentNode != document.body) {
			if(obj.parentNode.tagName.toLowerCase() == selector.toLowerCase()) {
				return obj.parentNode;
			}
			obj = obj.parentNode;
		}
		return false;
	},
	isParent: function(child, parent) {
		while(child.parentNode) {
			if(child.parentNode === parent) {
				return true;
			}
			child = child.parentNode;
		}
		return false;
	},
	getLabelFor: function(object) {
		var parentLabel = jcf.lib.getParent(object,'label');
		if(parentLabel) {
			return parentLabel;
		} else if(object.id) {
			return jcf.lib.queryBySelector('label[for="' + object.id + '"]')[0];
		}
	},
	disableTextSelection: function(el){
		if (typeof el.onselectstart !== 'undefined') {
			el.onselectstart = function() {return false};
		} else if(window.opera) {
			el.setAttribute('unselectable', 'on');
		} else {
			jcf.lib.addClass(el, jcf.baseOptions.unselectableClass);
		}
	},
	enableTextSelection: function(el) {
		if (typeof el.onselectstart !== 'undefined') {
			el.onselectstart = null;
		} else if(window.opera) {
			el.removeAttribute('unselectable');
		} else {
			jcf.lib.removeClass(el, jcf.baseOptions.unselectableClass);
		}
	},
	queryBySelector: function(selector, scope){
		return this.getElementsBySelector(selector, scope);
	},
	prevSibling: function(node) {
		while(node = node.previousSibling) if(node.nodeType == 1) break;
		return node;
	},
	nextSibling: function(node) {
		while(node = node.nextSibling) if(node.nodeType == 1) break;
		return node;
	},
	fireEvent: function(element,event) {
		if(element.dispatchEvent){
			var evt = document.createEvent('HTMLEvents');
			evt.initEvent(event, true, true );
			return !element.dispatchEvent(evt);
		}else if(document.createEventObject){
			var evt = document.createEventObject();
			return element.fireEvent('on'+event,evt);
		}
	},
	isParent: function(p, c) {
		while(c.parentNode) {
			if(p == c) {
				return true;
			}
			c = c.parentNode;
		}
		return false;
	},
	inherit: function(Child, Parent) {
		var F = function() { }
		F.prototype = Parent.prototype
		Child.prototype = new F()
		Child.prototype.constructor = Child
		Child.superclass = Parent.prototype
	},
	extend: function(obj) {
		for(var i = 1; i < arguments.length; i++) {
			for(var p in arguments[i]) {
				if(arguments[i].hasOwnProperty(p)) {
					obj[p] = arguments[i][p];
				}
			}
		}
		return obj;
	},
	hasClass: function (obj,cname) {
		return (obj.className ? obj.className.match(new RegExp('(\\s|^)'+cname+'(\\s|$)')) : false);
	},
	addClass: function (obj,cname) {
		if (!this.hasClass(obj,cname)) obj.className += (!obj.className.length || obj.className.charAt(obj.className.length - 1) === ' ' ? '' : ' ') + cname;
	},
	removeClass: function (obj,cname) {
		if (this.hasClass(obj,cname)) obj.className=obj.className.replace(new RegExp('(\\s|^)'+cname+'(\\s|$)'),' ').replace(/\s+$/, '');
	},
	toggleClass: function(obj, cname, condition) {
		if(condition) this.addClass(obj, cname); else this.removeClass(obj, cname);
	},
	createElement: function(tagName, options) {
		var el = document.createElement(tagName);
		for(var p in options) {
			if(options.hasOwnProperty(p)) {
				switch (p) {
					case 'class': el.className = options[p]; break;
					case 'html': el.innerHTML = options[p]; break;
					case 'style': this.setStyles(el, options[p]); break;
					default: el.setAttribute(p, options[p]);
				}
			}
		}
		return el;
	},
	setStyles: function(el, styles) {
		for(var p in styles) {
			if(styles.hasOwnProperty(p)) {
				switch (p) {
					case 'float': el.style.cssFloat = styles[p]; break;
					case 'opacity': el.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity='+styles[p]*100+')'; el.style.opacity = styles[p]; break;
					default: el.style[p] = (typeof styles[p] === 'undefined' ? 0 : styles[p]) + (typeof styles[p] === 'number' ? 'px' : '');
				}
			}
		}
		return el;
	},
	getInnerWidth: function(el) {
		return el.offsetWidth - (parseInt(this.getStyle(el,'paddingLeft')) || 0) - (parseInt(this.getStyle(el,'paddingRight')) || 0);
	},
	getInnerHeight: function(el) {
		return el.offsetHeight - (parseInt(this.getStyle(el,'paddingTop')) || 0) - (parseInt(this.getStyle(el,'paddingBottom')) || 0);
	},
	getAllClasses: function(cname, prefix, skip) {
		if(!skip) skip = '';
		if(!prefix) prefix = '';
		return cname ? cname.replace(new RegExp('(\\s|^)'+skip+'(\\s|$)'),' ').replace(/[\s]*([\S]+)+[\s]*/gi,prefix+"$1 ") : '';
	},
	getElementsBySelector: function(selector, scope) {
		if(typeof document.querySelectorAll === 'function') {
			return (scope || document).querySelectorAll(selector);
		}
		var selectors = selector.split(',');
		var resultList = [];
		for(var s = 0; s < selectors.length; s++) {
			var currentContext = [scope || document];
			var tokens = selectors[s].replace(/^\s+/,'').replace(/\s+$/,'').split(' ');
			for (var i = 0; i < tokens.length; i++) {
				token = tokens[i].replace(/^\s+/,'').replace(/\s+$/,'');
				if (token.indexOf('#') > -1) {
					var bits = token.split('#'), tagName = bits[0], id = bits[1];
					var element = document.getElementById(id);
					if (tagName && element.nodeName.toLowerCase() != tagName) {
						return [];
					}
					currentContext = [element];
					continue;
				}
				if (token.indexOf('.') > -1) {
					var bits = token.split('.'), tagName = bits[0] || '*', className = bits[1], found = [], foundCount = 0;
					for (var h = 0; h < currentContext.length; h++) {
						var elements;
						if (tagName == '*') {
							elements = currentContext[h].getElementsByTagName('*');
						} else {
							elements = currentContext[h].getElementsByTagName(tagName);
						}
						for (var j = 0; j < elements.length; j++) {
							found[foundCount++] = elements[j];
						}
					}
					currentContext = [];
					var currentContextIndex = 0;
					for (var k = 0; k < found.length; k++) {
						if (found[k].className && found[k].className.match(new RegExp('(\\s|^)'+className+'(\\s|$)'))) {
							currentContext[currentContextIndex++] = found[k];
						}
					}
					continue;
				}
				if (token.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/)) {
					var tagName = RegExp.$1 || '*', attrName = RegExp.$2, attrOperator = RegExp.$3, attrValue = RegExp.$4;
					if(attrName.toLowerCase() == 'for' && this.browser.msie && this.browser.version < 8) {
						attrName = 'htmlFor';
					}
					var found = [], foundCount = 0;
					for (var h = 0; h < currentContext.length; h++) {
						var elements;
						if (tagName == '*') {
							elements = currentContext[h].getElementsByTagName('*');
						} else {
							elements = currentContext[h].getElementsByTagName(tagName);
						}
						for (var j = 0; elements[j]; j++) {
							found[foundCount++] = elements[j];
						}
					}
					currentContext = [];
					var currentContextIndex = 0, checkFunction;
					switch (attrOperator) {
						case '=': checkFunction = function(e) { return (e.getAttribute(attrName) == attrValue) }; break;
						case '~': checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('(\\s|^)'+attrValue+'(\\s|$)'))) }; break;
						case '|': checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('^'+attrValue+'-?'))) }; break;
						case '^': checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) == 0) }; break;
						case '$': checkFunction = function(e) { return (e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length) }; break;
						case '*': checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) > -1) }; break;
						default : checkFunction = function(e) { return e.getAttribute(attrName) };
					}
					currentContext = [];
					var currentContextIndex = 0;
					for (var k = 0; k < found.length; k++) {
						if (checkFunction(found[k])) {
							currentContext[currentContextIndex++] = found[k];
						}
					}
					continue;
				}
				tagName = token;
				var found = [], foundCount = 0;
				for (var h = 0; h < currentContext.length; h++) {
					var elements = currentContext[h].getElementsByTagName(tagName);
					for (var j = 0; j < elements.length; j++) {
						found[foundCount++] = elements[j];
					}
				}
				currentContext = found;
			}
			resultList = [].concat(resultList,currentContext);
		}
		return resultList;
	},
	scrollSize: (function(){
		var content, hold, sizeBefore, sizeAfter;
		function buildSizer(){
			if(hold) removeSizer();
			content = document.createElement('div');
			hold = document.createElement('div');
			hold.style.cssText = 'position:absolute;overflow:hidden;width:100px;height:100px';
			hold.appendChild(content);
			document.body.appendChild(hold);
		}
		function removeSizer(){
			document.body.removeChild(hold);
			hold = null;
		}
		function calcSize(vertical) {
			buildSizer();
			content.style.cssText = 'height:'+(vertical ? '100%' : '200px');
			sizeBefore = (vertical ? content.offsetHeight : content.offsetWidth);
			hold.style.overflow = 'scroll'; content.innerHTML = 1;
			sizeAfter = (vertical ? content.offsetHeight : content.offsetWidth);
			if(vertical && hold.clientHeight) sizeAfter = hold.clientHeight;
			removeSizer();
			return sizeBefore - sizeAfter;
		}
		return {
			getWidth:function(){
				return calcSize(false);
			},
			getHeight:function(){
				return calcSize(true)
			}
		}
	}()),
	domReady: function (handler){
		var called = false
		function ready() {
			if (called) return;
			called = true;
			handler();
		}
		if (document.addEventListener) {
			document.addEventListener("DOMContentLoaded", ready, false);
		} else if (document.attachEvent) {
			if (document.documentElement.doScroll && window == window.top) {
				function tryScroll(){
					if (called) return
					if (!document.body) return
					try {
						document.documentElement.doScroll("left")
						ready()
					} catch(e) {
						setTimeout(tryScroll, 0)
					}
				}
				tryScroll()
			}
			document.attachEvent("onreadystatechange", function(){
				if (document.readyState === "complete") {
					ready()
				}
			})
		}
		if (window.addEventListener) window.addEventListener('load', ready, false)
		else if (window.attachEvent) window.attachEvent('onload', ready)
	},
	event: (function(){
		var guid = 0;
		function fixEvent(e) {
			e = e || window.event;
			if (e.isFixed) {
				return e;
			}
			e.isFixed = true; 
			e.preventDefault = e.preventDefault || function(){this.returnValue = false}
			e.stopPropagation = e.stopPropagaton || function(){this.cancelBubble = true}
			if (!e.target) {
				e.target = e.srcElement
			}
			if (!e.relatedTarget && e.fromElement) {
				e.relatedTarget = e.fromElement == e.target ? e.toElement : e.fromElement;
			}
			if (e.pageX == null && e.clientX != null) {
				var html = document.documentElement, body = document.body;
				e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
				e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
			}
			if (!e.which && e.button) {
				e.which = e.button & 1 ? 1 : (e.button & 2 ? 3 : (e.button & 4 ? 2 : 0));
			}
			if(e.type === "DOMMouseScroll" || e.type === 'mousewheel') {
				e.mWheelDelta = 0;
				if (e.wheelDelta) {
					e.mWheelDelta = e.wheelDelta/120;
				} else if (e.detail) {
					e.mWheelDelta = -e.detail/3;
				}
			}
			return e;
		}
		function commonHandle(event, customScope) {
			event = fixEvent(event);
			var handlers = this.events[event.type];
			for (var g in handlers) {
				var handler = handlers[g];
				var ret = handler.call(customScope || this, event);
				if (ret === false) {
					event.preventDefault()
					event.stopPropagation()
				}
			}
		}
		var publicAPI = {
			add: function(elem, type, handler, forcedScope) {
				if (elem.setInterval && (elem != window && !elem.frameElement)) {
					elem = window;
				}
				if (!handler.guid) {
					handler.guid = ++guid;
				}
				if (!elem.events) {
					elem.events = {};
					elem.handle = function(event) {
						return commonHandle.call(elem, event);
					}
				}
				if (!elem.events[type]) {
					elem.events[type] = {};
					if (elem.addEventListener) elem.addEventListener(type, elem.handle, false);
					else if (elem.attachEvent) elem.attachEvent("on" + type, elem.handle);
					if(type === 'mousewheel') {
						publicAPI.add(elem, 'DOMMouseScroll', handler, forcedScope);
					}
				}
				var fakeHandler = jcf.lib.bind(handler, forcedScope);
				fakeHandler.guid = handler.guid;
				elem.events[type][handler.guid] = forcedScope ? fakeHandler : handler;
			},
			remove: function(elem, type, handler) {
				var handlers = elem.events && elem.events[type];
				if (!handlers) return;
				delete handlers[handler.guid];
				for(var any in handlers) return;
				if (elem.removeEventListener) elem.removeEventListener(type, elem.handle, false);
				else if (elem.detachEvent) elem.detachEvent("on" + type, elem.handle);
				delete elem.events[type];
				for (var any in elem.events) return;
				try {
					delete elem.handle;
					delete elem.events;
				} catch(e) {
					if(elem.removeAttribute) {
						elem.removeAttribute("handle");
						elem.removeAttribute("events");
					}
				}
				if(type === 'mousewheel') {
					publicAPI.remove(elem, 'DOMMouseScroll', handler);
				}
			}
		}
		return publicAPI;
	}())
}

// custom scrollbars module
jcf.addModule({
	name:'customscroll',
	selector:'div.scrollable-area',
	defaultOptions: {
		alwaysPreventWheel: false,
		enableMouseWheel: true,
		captureFocus: false,
		handleNested: true,
		alwaysKeepScrollbars: false,
		autoDetectWidth: false,
		scrollbarOptions: {},
		focusClass:'scrollable-focus',
		wrapperTag: 'div',
		autoDetectWidthClass: 'autodetect-width',
		noHorizontalBarClass:'noscroll-horizontal',
		noVerticalBarClass:'noscroll-vertical',
		innerWrapperClass:'scrollable-inner-wrapper',
		outerWrapperClass:'scrollable-area-wrapper',
		horizontalClass: 'hscrollable',
		verticalClass: 'vscrollable',
		bothClass: 'anyscrollable'
	},
	replaceObject: function(){
		this.initStructure();
		this.refreshState();
		this.addEvents();
	},
	initStructure: function(){
		// set scroll type
		this.realElement.jcf = this;
		if(jcf.lib.hasClass(this.realElement, this.options.bothClass) || 
		jcf.lib.hasClass(this.realElement, this.options.horizontalClass) && jcf.lib.hasClass(this.realElement, this.options.verticalClass)) {
			this.scrollType = 'both';
		} else if(jcf.lib.hasClass(this.realElement, this.options.horizontalClass)) {
			this.scrollType = 'horizontal';
		} else {
			this.scrollType = 'vertical';
		}
		
		// autodetect horizontal width
		if(jcf.lib.hasClass(this.realElement,this.options.autoDetectWidthClass)) {
			this.options.autoDetectWidth = true;
		}
		
		// init dimensions and build structure
		this.realElement.style.position = 'relative';
		this.realElement.style.overflow = 'hidden';
		
		// build content wrapper and scrollbar(s)
		this.buildWrapper();
		this.buildScrollbars();
	},
	buildWrapper: function() {
		this.outerWrapper = document.createElement(this.options.wrapperTag);
		this.outerWrapper.className = this.options.outerWrapperClass;
		this.realElement.parentNode.insertBefore(this.outerWrapper, this.realElement);
		this.outerWrapper.appendChild(this.realElement);
		
		// autosize content if single child
		if(this.options.autoDetectWidth && (this.scrollType === 'both' || this.scrollType === 'horizontal') && this.realElement.children.length === 1) {
			var tmpWidth = 0;
			this.realElement.style.width = '99999px';
			tmpWidth = this.realElement.children[0].offsetWidth;
			this.realElement.style.width = '';
			if(tmpWidth) {
				this.realElement.children[0].style.width = tmpWidth+'px';
			}
		}
	},
	buildScrollbars: function() {
		if(this.scrollType === 'horizontal' || this.scrollType === 'both') {
			this.hScrollBar = new jcf.plugins.scrollbar(jcf.lib.extend(this.options.scrollbarOptions,{
				vertical: false,
				spawnClass: this,
				holder: this.outerWrapper,
				range: this.realElement.scrollWidth - this.realElement.offsetWidth,
				size: this.realElement.offsetWidth,
				onScroll: jcf.lib.bind(function(v) {
					this.realElement.scrollLeft = v;
				},this)
			}));
		}
		if(this.scrollType === 'vertical' || this.scrollType === 'both') {
			this.vScrollBar = new jcf.plugins.scrollbar(jcf.lib.extend(this.options.scrollbarOptions,{
				vertical: true,
				spawnClass: this,
				holder: this.outerWrapper,
				range: this.realElement.scrollHeight - this.realElement.offsetHeight,
				size: this.realElement.offsetHeight,
				onScroll: jcf.lib.bind(function(v) {
					this.realElement.scrollTop = v;
				},this)
			}));
		}
		this.outerWrapper.style.width = this.realElement.offsetWidth + 'px';
		this.outerWrapper.style.height = this.realElement.offsetHeight + 'px';
		this.resizeScrollContent();
	},
	resizeScrollContent: function() {
		var diffWidth = this.realElement.offsetWidth - jcf.lib.getInnerWidth(this.realElement);
		var diffHeight = this.realElement.offsetHeight - jcf.lib.getInnerHeight(this.realElement);
		this.realElement.style.width = Math.max(0, this.outerWrapper.offsetWidth - diffWidth - (this.vScrollBar ? this.vScrollBar.getScrollBarSize() : 0)) + 'px';
		this.realElement.style.height = Math.max(0, this.outerWrapper.offsetHeight - diffHeight - (this.hScrollBar ? this.hScrollBar.getScrollBarSize() : 0)) + 'px';
	},
	addEvents: function() {
		// enable mouse wheel handling
		if(!jcf.isTouchDevice && this.options.enableMouseWheel) {
			jcf.lib.event.add(this.outerWrapper, 'mousewheel', this.onMouseWheel, this);
		}
		// add touch scroll on block body
		if(jcf.isTouchDevice || navigator.msPointerEnabled) {
			this.outerWrapper.style.msTouchAction = 'none';
			jcf.lib.event.add(this.realElement, jcf.eventPress, this.onScrollablePress, this);
		}
		
		// handle nested scrollbars
		if(this.options.handleNested) {
			var el = this.realElement, name = this.name;
			while(el.parentNode) {
				if(el.parentNode.jcf && el.parentNode.jcf.name == name) {
					el.parentNode.jcf.refreshState();
				}
				el = el.parentNode;
			}
		}
	},
	onMouseWheel: function(e) {
		if(this.scrollType === 'vertical' || this.scrollType === 'both') {
			return this.vScrollBar.doScrollWheelStep(e.mWheelDelta) === false ? false : !this.options.alwaysPreventWheel;
		} else {
			return this.hScrollBar.doScrollWheelStep(e.mWheelDelta) === false ? false : !this.options.alwaysPreventWheel;
		}
	},
	onScrollablePress: function(e) {
		if(e.pointerType !== e.MSPOINTER_TYPE_TOUCH) return;

		this.preventFlag = true;
		this.origWindowScrollTop = jcf.lib.getScrollTop();
		this.origWindowScrollLeft = jcf.lib.getScrollLeft();
	
		this.scrollableOffset = jcf.lib.getOffset(this.realElement);
		if(this.hScrollBar) {
			this.scrollableTouchX = (jcf.isTouchDevice ? e.changedTouches[0] : e).pageX;
			this.origValueX = this.hScrollBar.getScrollValue();
		}
		if(this.vScrollBar) {
			this.scrollableTouchY = (jcf.isTouchDevice ? e.changedTouches[0] : e).pageY;
			this.origValueY = this.vScrollBar.getScrollValue();
		}
		jcf.lib.event.add(this.realElement, jcf.eventMove, this.onScrollableMove, this);
		jcf.lib.event.add(this.realElement, jcf.eventRelease, this.onScrollableRelease, this);
	},
	onScrollableMove: function(e) {
		if(this.vScrollBar) {
			var difY = (jcf.isTouchDevice ? e.changedTouches[0] : e).pageY - this.scrollableTouchY;
			var valY = this.origValueY-difY;
			this.vScrollBar.scrollTo(valY);
			if(valY < 0 || valY > this.vScrollBar.options.range) {
				this.preventFlag = false;
			}
		}
		if(this.hScrollBar) {
			var difX = (jcf.isTouchDevice ? e.changedTouches[0] : e).pageX - this.scrollableTouchX;
			var valX = this.origValueX-difX;
			this.hScrollBar.scrollTo(valX);
			if(valX < 0 || valX > this.hScrollBar.options.range) {
				this.preventFlag = false;
			}
		}
		if(this.preventFlag) {
			e.preventDefault();
		}
	},
	onScrollableRelease: function() {
		jcf.lib.event.remove(this.realElement, jcf.eventMove, this.onScrollableMove);
		jcf.lib.event.remove(this.realElement, jcf.eventRelease, this.onScrollableRelease);
	},
	refreshState: function() {
		if(this.options.alwaysKeepScrollbars) {
			if(this.hScrollBar) this.hScrollBar.scrollBar.style.display = 'block';
			if(this.vScrollBar) this.vScrollBar.scrollBar.style.display = 'block';
		} else {
			if(this.hScrollBar) {
				if(this.getScrollRange(false)) {
					this.hScrollBar.scrollBar.style.display = 'block';
					this.resizeScrollContent();
					this.hScrollBar.setRange(this.getScrollRange(false));
				} else {
					this.hScrollBar.scrollBar.style.display = 'none';
					this.realElement.style.width = this.outerWrapper.style.width;
				}
				jcf.lib.toggleClass(this.outerWrapper, this.options.noHorizontalBarClass, this.hScrollBar.options.range === 0);
			}
			if(this.vScrollBar) {
				if(this.getScrollRange(true) > 0) {
					this.vScrollBar.scrollBar.style.display = 'block';
					this.resizeScrollContent();
					this.vScrollBar.setRange(this.getScrollRange(true));
				} else {
					this.vScrollBar.scrollBar.style.display = 'none';
					this.realElement.style.width = this.outerWrapper.style.width;
				}
				jcf.lib.toggleClass(this.outerWrapper, this.options.noVerticalBarClass, this.vScrollBar.options.range === 0);
			}
		}
		if(this.vScrollBar) {
			this.vScrollBar.setRange(this.realElement.scrollHeight - this.realElement.offsetHeight);
			this.vScrollBar.setSize(this.realElement.offsetHeight);
			this.vScrollBar.scrollTo(this.realElement.scrollTop);
		}
		if(this.hScrollBar) {
			this.hScrollBar.setRange(this.realElement.scrollWidth - this.realElement.offsetWidth);
			this.hScrollBar.setSize(this.realElement.offsetWidth);
			this.hScrollBar.scrollTo(this.realElement.scrollLeft);
		}
	},
	getScrollRange: function(isVertical) {
		if(isVertical) {
			return this.realElement.scrollHeight - this.realElement.offsetHeight;
		} else {
			return this.realElement.scrollWidth - this.realElement.offsetWidth;
		}
	},
	getCurrentRange: function(scrollInstance) {
		return this.getScrollRange(scrollInstance.isVertical);
	},
	onCreateModule: function(){
		if(jcf.modules.select) {
			this.extendSelect();
		}
		if(jcf.modules.selectmultiple) {
			this.extendSelectMultiple();
		}
		if(jcf.modules.textarea) {
			this.extendTextarea();
		}
	},
	onModuleAdded: function(module){
		if(module.prototype.name == 'select') {
			this.extendSelect();
		}
		if(module.prototype.name == 'selectmultiple') {
			this.extendSelectMultiple();
		}
		if(module.prototype.name == 'textarea') {
			this.extendTextarea();
		}
	},
	extendSelect: function() {
		// add scrollable if needed on control ready
		jcf.modules.select.prototype.onControlReady = function(obj){
			if(obj.selectList.scrollHeight > obj.selectList.offsetHeight) {
				obj.jcfScrollable = new jcf.modules.customscroll({
					alwaysPreventWheel: true,
					replaces:obj.selectList
				});
			}
		}
		// update scroll function
		var orig = jcf.modules.select.prototype.scrollToItem;
		jcf.modules.select.prototype.scrollToItem = function(){
			orig.apply(this);
			if(this.jcfScrollable) {
				this.jcfScrollable.refreshState();
			}
		}
	},
	extendTextarea: function() {
		// add scrollable if needed on control ready
		jcf.modules.textarea.prototype.onControlReady = function(obj){
			obj.jcfScrollable = new jcf.modules.customscroll({
				alwaysKeepScrollbars: true,
				alwaysPreventWheel: true,
				replaces: obj.realElement
			});
		}
		// update scroll function
		var orig = jcf.modules.textarea.prototype.refreshState;
		jcf.modules.textarea.prototype.refreshState = function(){
			orig.apply(this);
			if(this.jcfScrollable) {
				this.jcfScrollable.refreshState();
			}
		}
	},
	extendSelectMultiple: function(){
		// add scrollable if needed on control ready
		jcf.modules.selectmultiple.prototype.onControlReady = function(obj){
			//if(obj.optionsHolder.scrollHeight > obj.optionsHolder.offsetHeight) {
				obj.jcfScrollable = new jcf.modules.customscroll({
					alwaysPreventWheel: true,
					replaces:obj.optionsHolder
				});
			//}
		}
		// update scroll function
		var orig = jcf.modules.selectmultiple.prototype.scrollToItem;
		jcf.modules.selectmultiple.prototype.scrollToItem = function(){
			orig.apply(this);
			if(this.jcfScrollable) {
				this.jcfScrollable.refreshState();
			}
		}
		
		// update scroll size?
		var orig2 = jcf.modules.selectmultiple.prototype.rebuildOptions;
		jcf.modules.selectmultiple.prototype.rebuildOptions = function(){
			orig2.apply(this);
			if(this.jcfScrollable) {
				this.jcfScrollable.refreshState();
			}
		}
		
	}
});

// scrollbar plugin
jcf.addPlugin({
	name: 'scrollbar',
	defaultOptions: {
		size: 0,
		range: 0,
		moveStep: 6,
		moveDistance: 50,
		moveInterval: 10,
		trackHoldDelay: 900,
		holder: null,
		vertical: true,
		scrollTag: 'div',
		onScroll: function(){},
		onScrollEnd: function(){},
		onScrollStart: function(){},
		disabledClass: 'btn-disabled',
		VscrollBarClass:'vscrollbar',
		VscrollStructure: '<div class="vscroll-up"></div><div class="vscroll-line"><div class="vscroll-slider"><div class="scroll-bar-top"></div><div class="scroll-bar-bottom"></div></div></div></div><div class="vscroll-down"></div>',
		VscrollTrack: 'div.vscroll-line',
		VscrollBtnDecClass:'div.vscroll-up',
		VscrollBtnIncClass:'div.vscroll-down',
		VscrollSliderClass:'div.vscroll-slider',
		HscrollBarClass:'hscrollbar',
		HscrollStructure: '<div class="hscroll-left"></div><div class="hscroll-line"><div class="hscroll-slider"><div class="scroll-bar-left"></div><div class="scroll-bar-right"></div></div></div></div><div class="hscroll-right"></div>',
		HscrollTrack: 'div.hscroll-line',
		HscrollBtnDecClass:'div.hscroll-left',
		HscrollBtnIncClass:'div.hscroll-right',
		HscrollSliderClass:'div.hscroll-slider'
	},
	init: function(userOptions) {
		this.setOptions(userOptions);
		this.createScrollBar();
		this.attachEvents();
		this.setSize();
	},
	setOptions: function(extOptions) {
		// merge options
		this.options = jcf.lib.extend({}, this.defaultOptions, extOptions);
		this.isVertical = this.options.vertical;
		this.prefix = this.isVertical ? 'V' : 'H';
		this.eventPageOffsetProperty = this.isVertical ? 'pageY' : 'pageX';
		this.positionProperty = this.isVertical ? 'top' : 'left';
		this.sizeProperty = this.isVertical ? 'height' : 'width';
		this.dimenionsProperty = this.isVertical ? 'offsetHeight' : 'offsetWidth';
		this.invertedDimenionsProperty = !this.isVertical ? 'offsetHeight' : 'offsetWidth';
		
		// set corresponding classes
		for(var p in this.options) {
			if(p.indexOf(this.prefix) == 0) {
				this.options[p.substr(1)] = this.options[p];
			}
		}
	},
	createScrollBar: function() {
		// create dimensions
		this.scrollBar = document.createElement(this.options.scrollTag);
		this.scrollBar.className = this.options.scrollBarClass;
		this.scrollBar.innerHTML = this.options.scrollStructure;
		
		// get elements
		this.track = jcf.lib.queryBySelector(this.options.scrollTrack,this.scrollBar)[0];
		this.btnDec = jcf.lib.queryBySelector(this.options.scrollBtnDecClass,this.scrollBar)[0];
		this.btnInc = jcf.lib.queryBySelector(this.options.scrollBtnIncClass,this.scrollBar)[0];
		this.slider = jcf.lib.queryBySelector(this.options.scrollSliderClass,this.scrollBar)[0];
		this.slider.style.position = 'absolute';
		this.track.style.position = 'relative';
	},
	attachEvents: function() {
		// append scrollbar to holder if provided
		if(this.options.holder) {
			this.options.holder.appendChild(this.scrollBar);
		}
		
		// attach listeners for slider and buttons
		jcf.lib.event.add(this.slider, jcf.eventPress, this.onSliderPressed, this);
		jcf.lib.event.add(this.btnDec, jcf.eventPress, this.onBtnDecPressed, this);
		jcf.lib.event.add(this.btnInc, jcf.eventPress, this.onBtnIncPressed, this);
		jcf.lib.event.add(this.track, jcf.eventPress, this.onTrackPressed, this);
	},
	setSize: function(value) {
		if(typeof value === 'number') {
			this.options.size = value;
		}
		this.scrollOffset = this.scrollValue = this.sliderOffset = 0;
		this.scrollBar.style[this.sizeProperty] = this.options.size + 'px';
		this.resizeControls();
		this.refreshSlider();
	},
	setRange: function(r) {
		this.options.range = Math.max(r,0);
		this.resizeControls();
	},
	doScrollWheelStep: function(direction) {
		// 1 - scroll up, -1 scroll down
		this.startScroll();
		if((direction < 0 && !this.isEndPosition()) || (direction > 0 && !this.isStartPosition())) {
			this.scrollTo(this.getScrollValue()-this.options.moveDistance * direction);
			this.moveScroll();
			this.endScroll();
			return false;
		}
	},
	resizeControls: function() {
		// calculate dimensions
		this.barSize = this.scrollBar[this.dimenionsProperty];
		this.btnDecSize = this.btnDec[this.dimenionsProperty];
		this.btnIncSize = this.btnInc[this.dimenionsProperty];
		this.trackSize = this.barSize - this.btnDecSize - this.btnIncSize;
		
		// resize and reposition elements
		this.track.style[this.sizeProperty] = this.trackSize + 'px';
		this.trackSize = this.track[this.dimenionsProperty];
		this.sliderSize = this.getSliderSize();
		this.slider.style[this.sizeProperty] = this.sliderSize + 'px';
		this.sliderSize = this.slider[this.dimenionsProperty];
	},
	refreshSlider: function(complete) {
		// refresh dimensions
		if(complete) {
			this.resizeControls();
		}
		// redraw slider and classes
		this.sliderOffset = isNaN(this.sliderOffset) ? 0 : this.sliderOffset;
		this.slider.style[this.positionProperty] = this.sliderOffset + 'px';
	},
	startScroll: function() {
		// refresh range if possible
		if(this.options.spawnClass && typeof this.options.spawnClass.getCurrentRange === 'function') {
			this.setRange(this.options.spawnClass.getCurrentRange(this));
		}
		this.resizeControls();
		this.scrollBarOffset = jcf.lib.getOffset(this.track)[this.positionProperty];
		this.options.onScrollStart();
	},
	moveScroll: function() {
		this.options.onScroll(this.scrollValue);
		
		// add disabled classes
		jcf.lib.removeClass(this.btnDec, this.options.disabledClass);
		jcf.lib.removeClass(this.btnInc, this.options.disabledClass);
		if(this.scrollValue === 0) {
			jcf.lib.addClass(this.btnDec, this.options.disabledClass);
		}
		if(this.scrollValue === this.options.range) {
			jcf.lib.addClass(this.btnInc, this.options.disabledClass);
		}
	},
	endScroll: function() {
		this.options.onScrollEnd();
	},
	startButtonMoveScroll: function(direction) {
		this.startScroll();
		clearInterval(this.buttonScrollTimer);
		this.buttonScrollTimer = setInterval(jcf.lib.bind(function(){
			this.scrollValue += this.options.moveStep * direction
			if(this.scrollValue > this.options.range) {
				this.scrollValue = this.options.range;
				this.endButtonMoveScroll();
			} else if(this.scrollValue < 0) {
				this.scrollValue = 0;
				this.endButtonMoveScroll();
			}
			this.scrollTo(this.scrollValue);
			
		},this),this.options.moveInterval);
	},
	endButtonMoveScroll: function() {
		clearInterval(this.buttonScrollTimer);
		this.endScroll();
	},
	isStartPosition: function() {
		return this.scrollValue === 0;
	},
	isEndPosition: function() {
		return this.scrollValue === this.options.range;
	},
	getSliderSize: function() {
		return Math.round(this.getSliderSizePercent() * this.trackSize / 100);
	},
	getSliderSizePercent: function() {
		return this.options.range === 0 ? 0 : this.barSize * 100 / (this.barSize + this.options.range);
	},
	getSliderOffsetByScrollValue: function() {
		return (this.scrollValue * 100 / this.options.range) * (this.trackSize - this.sliderSize) / 100;
	},
	getSliderOffsetPercent: function() {
		return this.sliderOffset * 100 / (this.trackSize - this.sliderSize);
	},
	getScrollValueBySliderOffset: function() {
		return this.getSliderOffsetPercent() * this.options.range / 100;
	},
	getScrollBarSize: function() {
		return this.scrollBar[this.invertedDimenionsProperty];
	},
	getScrollValue: function() {
		return this.scrollValue || 0;
	},
	scrollOnePage: function(direction) {
		this.scrollTo(this.scrollValue + direction*this.barSize);
	},
	scrollTo: function(x) {
		this.scrollValue = x < 0 ? 0 : x > this.options.range ? this.options.range : x;
		this.sliderOffset = this.getSliderOffsetByScrollValue();
		this.refreshSlider();
		this.moveScroll();
	},
	onSliderPressed: function(e){
		jcf.lib.event.add(document.body, jcf.eventRelease, this.onSliderRelease, this);
		jcf.lib.event.add(document.body, jcf.eventMove, this.onSliderMove, this);
		jcf.lib.disableTextSelection(this.slider);
		
		// calculate offsets once
		this.sliderInnerOffset = (jcf.isTouchDevice ? e.changedTouches[0] : e)[this.eventPageOffsetProperty] - jcf.lib.getOffset(this.slider)[this.positionProperty];
		this.startScroll();
		return false;
	},
	onSliderRelease: function(){
		jcf.lib.event.remove(document.body, jcf.eventRelease, this.onSliderRelease);
		jcf.lib.event.remove(document.body, jcf.eventMove, this.onSliderMove);
	},
	onSliderMove: function(e) {
		this.sliderOffset = (jcf.isTouchDevice ? e.changedTouches[0] : e)[this.eventPageOffsetProperty] - this.scrollBarOffset - this.sliderInnerOffset;
		if(this.sliderOffset < 0) {
			this.sliderOffset = 0;
		} else if(this.sliderOffset + this.sliderSize > this.trackSize) {
			this.sliderOffset = this.trackSize - this.sliderSize;
		}
		if(this.previousOffset != this.sliderOffset) {
			this.previousOffset = this.sliderOffset;
			this.scrollTo(this.getScrollValueBySliderOffset());
		}
	},
	onBtnIncPressed: function() {
		jcf.lib.event.add(document.body, jcf.eventRelease, this.onBtnIncRelease, this);
		jcf.lib.disableTextSelection(this.btnInc);
		this.startButtonMoveScroll(1);
		return false;
	},
	onBtnIncRelease: function() {
		jcf.lib.event.remove(document.body, jcf.eventRelease, this.onBtnIncRelease);
		this.endButtonMoveScroll();
	},
	onBtnDecPressed: function() {
		jcf.lib.event.add(document.body, jcf.eventRelease, this.onBtnDecRelease, this);
		jcf.lib.disableTextSelection(this.btnDec);
		this.startButtonMoveScroll(-1);
		return false;
	},
	onBtnDecRelease: function() {
		jcf.lib.event.remove(document.body, jcf.eventRelease, this.onBtnDecRelease);
		this.endButtonMoveScroll();
	},
	onTrackPressed: function(e) {
		var position = e[this.eventPageOffsetProperty] - jcf.lib.getOffset(this.track)[this.positionProperty];
		var direction = position < this.sliderOffset ? -1 : position > this.sliderOffset + this.sliderSize ? 1 : 0;
		if(direction) {
			this.scrollOnePage(direction);
		}
	}
});
/*
 * Browser platform detection
 */
PlatformDetect = (function(){
	var detectModules = {};
	return {
		options: {
			cssPath: 'css/'
		},
		addModule: function(obj) {
			detectModules[obj.type] = obj;
		},
		addRule: function(rule) {
			if(this.matchRule(rule)) {
				this.applyRule(rule);
				return true;
			}
		},
		matchRule: function(rule) {
			return detectModules[rule.type].matchRule(rule);
		},
		applyRule: function(rule) {
			var head = document.getElementsByTagName('head')[0], fragment, cssText;
			if(rule.css) {
				cssText = '<link rel="stylesheet" href="' + this.options.cssPath + rule.css + '" />';
				if(head) {
					fragment = document.createElement('div');
					fragment.innerHTML = cssText;
					head.appendChild(fragment.childNodes[0]);
				} else {
					document.write(cssText);
				}
			}
			
			if(rule.meta) {
				if(head) {
					fragment = document.createElement('div');
					fragment.innerHTML = rule.meta;
					head.appendChild(fragment.childNodes[0]);
				} else {
					document.write(rule.meta);
				}
			}
		},
		matchVersions: function(host, target) {
			target = target.toString();
			host = host.toString();

			var majorVersionMatch = parseInt(target, 10) === parseInt(host, 10);
			var minorVersionMatch = (host.length > target.length ? host.indexOf(target) : target.indexOf(host)) === 0;

			return majorVersionMatch && minorVersionMatch;
		}
	};
}());

// All Mobile detection
PlatformDetect.addModule({
	type: 'allmobile',
	uaMatch: function(str) {
		if(!this.ua) {
			this.ua = navigator.userAgent.toLowerCase();
		}
		return this.ua.indexOf(str.toLowerCase()) != -1;
	},
	matchRule: function(rule) {
		return this.uaMatch('mobi') || this.uaMatch('midp') || this.uaMatch('ppc') || this.uaMatch('webos') || this.uaMatch('android') || this.uaMatch('phone os') || this.uaMatch('touch');
	}
});

// Detect rules
PlatformDetect.addRule({type: 'allmobile', css: 'allmobile.css'});