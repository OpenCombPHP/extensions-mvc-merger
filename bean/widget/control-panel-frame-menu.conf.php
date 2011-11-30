<?php
return array(
	array(
		'title' => '高级网页维护' ,
		'menu' => array(
			'direction' => 'v' ,
			'independence' => true ,
			'items' => array(
					array(
							'title'=>'建立控制器' ,
							'link' => '?c=org.opencomb.mvcmerger.merger.ControllerBuilder' ,
					) ,
					array(
							'title'=>'控制器融合' ,
							'link' => '?c=org.opencomb.mvcmerger.merger.ControllerMerger' ,
					) ,
					array(
							'title'=>'建立模板' ,
							'link' => '?c=org.opencomb.mvcmerger.merger.TemplateBuilder' ,
					) ,
					array(
							'title'=>'模板编织' ,
							'link' => '?c=org.opencomb.mvcmerger.merger.TemplateWeaver' ,
					) ,
					array(
							'title'=>'视图布局' ,
							'link' => '?c=org.opencomb.mvcmerger.merger.ViewLayerout' ,
					) ,
			) ,
		) ,
	) ,
) ;