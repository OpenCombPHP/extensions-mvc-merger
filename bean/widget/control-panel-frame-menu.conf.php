<?php
return array(
	array(
		'title' => '高级网页维护' ,
		'link' => '?c=org.opencomb.mvcmerger.merger.ControllerMerger' ,
		'menu' => array(
			'direction' => 'v' ,
			'items' => array(
					array(
							'title'=>'建立网页' ,
							//'link' => '?c=org.opencomb.mvcmerger.merger.ControllerBuilder' ,
							//'query' => 'c=org.opencomb.mvcmerger.merger.ControllerBuilder' ,
					) ,
					array(
							'title'=>'网页融合' ,
							'link' => '?c=org.opencomb.mvcmerger.merger.ControllerMerger' ,
							'query' => 'c=org.opencomb.mvcmerger.merger.ControllerMerger' ,
					) ,
					array(
							'title'=>'建立模板' ,
							//'link' => '?c=org.opencomb.mvcmerger.merger.TemplateBuilder' ,
							//'query' => 'c=org.opencomb.mvcmerger.merger.TemplateBuilder' ,
					) ,
					array(
							'title'=>'模板编织' ,
							//'link' => '?c=org.opencomb.mvcmerger.merger.TemplateWeaver' ,
							//'query' => 'c=org.opencomb.mvcmerger.merger.TemplateWeaver' ,
					) ,
					array(
							'title'=>'视图布局' ,
							'link' => '?c=org.opencomb.mvcmerger.merger.ViewLayerout' ,
							'query' => 'c=org.opencomb.mvcmerger.merger.ViewLayerout' ,
					) ,
			) ,
		) ,
	) ,
) ;