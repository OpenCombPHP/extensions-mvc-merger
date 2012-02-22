<?php
return array(
	'item:mvc-merger' => array(
		'title' => '高级网页维护' ,
		'link' => '?c=org.opencomb.mvcmerger.merger.ControllerMerger' ,
		'direction' => 'v' ,
		
		'menu' => 1 ,
		'item:builder' => array(
			'title'=>'建立网页' ,
			//'link' => '?c=org.opencomb.mvcmerger.merger.ControllerBuilder' ,
			//'query' => 'c=org.opencomb.mvcmerger.merger.ControllerBuilder' ,
		) ,
		'item:merger' => array(
			'title'=>'网页融合' ,
			'link' => '?c=org.opencomb.mvcmerger.merger.ControllerMerger' ,
			'query' => 'c=org.opencomb.mvcmerger.merger.ControllerMerger' ,
		) ,
		'item:templatebuilder' => array(
			'title'=>'建立模板' ,
			//'link' => '?c=org.opencomb.mvcmerger.merger.TemplateBuilder' ,
			//'query' => 'c=org.opencomb.mvcmerger.merger.TemplateBuilder' ,
		) ,
		'item:templateweave' => array(
			'title'=>'模板编织' ,
			'link' => '?c=org.opencomb.mvcmerger.merger.UITemplateWeave' ,
			'query' => 'c=org.opencomb.mvcmerger.merger.UITemplateWeave' ,
		) ,
		'item:viewlayerout' => array(
			'title'=>'视图布局' ,
			'link' => '?c=org.opencomb.mvcmerger.merger.ViewLayerout' ,
			'query' => 'c=org.opencomb.mvcmerger.merger.ViewLayerout' ,
		) ,
	) ,
) ;