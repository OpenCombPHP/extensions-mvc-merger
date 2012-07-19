<?php
namespace org\opencomb\mvcmerger\setup;

use org\jecat\framework\db\DB ;
use org\jecat\framework\message\Message;
use org\jecat\framework\message\MessageQueue;
use org\opencomb\platform\ext\Extension;
use org\opencomb\platform\ext\ExtensionMetainfo ;
use org\opencomb\platform\ext\IExtensionDataInstaller ;
use org\jecat\framework\fs\Folder;

// 这个 DataInstaller 程序是由扩展 development-toolkit 的 create data installer 模块自动生成
// 扩展 development-toolkit 版本：0.2.0.0
// create data installer 模块版本：1.0.8.0

class DataInstaller implements IExtensionDataInstaller
{
	public function install(MessageQueue $aMessageQueue,ExtensionMetainfo $aMetainfo)
	{
		$aExtension = new Extension($aMetainfo);
		
		// 1 . create data table
		
		
		
		// 2. insert table data
		
		
		// 3. settings
		
		$aSetting = $aExtension->setting() ;
			
				
		$aSetting->setItem('/merge/layout/org.opencomb.opencms.index.Index/','*',array (
  'assemble' => 
  array (
    'frame-0' => 
    array (
      'type' => 'frame',
      'id' => 'frame-0',
      'cssClass' => 
      array (
        0 => 'jc-layout',
        1 => 'jc-frame',
        2 => 'jc-frame-vertical',
      ),
      'items' => 
      array (
        0 => 
        array (
          'type' => 'view',
          'id' => 'coresystem_FrontFrame_html-0',
          'cssClass' => 
          array (
            0 => 'jc-layout',
            1 => 'jc-view',
            2 => 'jc-layout-item-vertical',
          ),
          'style' => 'width: auto;',
          'xpath' => '/org.jecat.framework.mvc.controller.WebpageFrame/frameView',
        ),
      ),
      'xpath' => '/org.jecat.framework.mvc.controller.WebpageFrame/frame-pos-0',
      'layout' => 'v',
    ),
    'frame-1' => 
    array (
      'type' => 'frame',
      'id' => 'frame-1',
      'cssClass' => 
      array (
        0 => 'jc-layout',
        1 => 'jc-frame',
        2 => 'jc-frame-vertical',
      ),
      'items' => 
      array (
        0 => 
        array (
          'type' => 'view',
          'id' => 'bannermanager_ViewAdvertisement_html-0',
          'cssClass' => 
          array (
            0 => '',
            1 => 'jc-layout-item-vertical',
            2 => 'jc-view',
            3 => 'jc-layout',
          ),
          'style' => 'width: auto; padding-left: 10px; padding-bottom: 5px; padding-top: 2px;',
          'xpath' => '/106',
        ),
        1 => 
        array (
          'type' => 'frame',
          'id' => 'cusFrame-1',
          'cssClass' => 
          array (
            0 => 'jc-layout',
            1 => 'jc-frame',
            2 => 'cusframe',
            3 => 'jc-frame-horizontal',
            4 => 'jc-layout-item-vertical',
          ),
          'style' => 'width: auto;',
          'items' => 
          array (
            0 => 
            array (
              'type' => 'view',
              'id' => 'opencms_TopList_html-0',
              'cssClass' => 
              array (
                0 => 'jc-layout',
                1 => 'jc-view',
                2 => 'jc-view-decorater-oc',
                3 => 'jc-layout-item-horizontal',
              ),
              'style' => 'width: 284px; height: 163px;',
              'xpath' => '/topList_new_1',
            ),
            1 => 
            array (
              'type' => 'view',
              'id' => 'opencms_TopList_html-1',
              'cssClass' => 
              array (
                0 => 'jc-layout',
                1 => 'jc-view',
                2 => 'jc-view-decorater-oc',
                3 => 'jc-layout-item-horizontal',
              ),
              'style' => 'width: 285px; height: 163px;',
              'xpath' => '/topList_new_7',
            ),
            2 => 
            array (
              'type' => 'view',
              'id' => 'opencms_TopList_html-2',
              'cssClass' => 
              array (
                0 => 'jc-layout',
                1 => 'jc-view',
                2 => 'jc-view-decorater-oc',
                3 => 'jc-layout-item-horizontal',
              ),
              'style' => 'width: 285px; height: 163px;',
              'xpath' => '/topList_new_6',
            ),
          ),
          'xpath' => '/org.jecat.framework.mvc.controller.WebpageFrame/frameView/frame-pos-0/cusFrame-1',
          'layout' => 'h',
          'customFrame' => 'true',
        ),
        2 => 
        array (
          'type' => 'frame',
          'id' => 'cusFrame-0',
          'cssClass' => 
          array (
            0 => 'jc-layout',
            1 => 'jc-frame',
            2 => 'cusframe',
            3 => 'jc-frame-horizontal',
            4 => 'jc-layout-item-vertical',
          ),
          'style' => 'width: auto;',
          'items' => 
          array (
            0 => 
            array (
              'type' => 'view',
              'id' => 'opencms_TopList_html-3',
              'cssClass' => 
              array (
                0 => 'jc-layout',
                1 => 'jc-view',
                2 => 'jc-view-decorater-oc',
                3 => 'jc-layout-item-horizontal',
              ),
              'style' => 'width: 284px; height: 173px;',
              'xpath' => '/topList_new_4',
            ),
            1 => 
            array (
              'type' => 'view',
              'id' => 'opencms_TopList_html-4',
              'cssClass' => 
              array (
                0 => 'jc-layout',
                1 => 'jc-view',
                2 => 'jc-view-decorater-oc',
                3 => 'jc-layout-item-horizontal',
              ),
              'style' => 'width: 285px; height: 173px;',
              'xpath' => '/topList_new_3',
            ),
            2 => 
            array (
              'type' => 'view',
              'id' => 'opencms_TopList_html-5',
              'cssClass' => 
              array (
                0 => 'jc-layout',
                1 => 'jc-view',
                2 => 'jc-view-decorater-oc',
                3 => 'jc-layout-item-horizontal',
              ),
              'style' => 'width: 285px; height: 173px;',
              'xpath' => '/topList_new_5',
            ),
          ),
          'xpath' => '/org.jecat.framework.mvc.controller.WebpageFrame/frameView/frame-pos-0/cusFrame-0',
          'layout' => 'h',
          'customFrame' => 'true',
        ),
        3 => 
        array (
          'type' => 'view',
          'id' => 'opencms_TopList_html-6',
          'cssClass' => 
          array (
            0 => 'jc-layout',
            1 => 'jc-view',
            2 => 'jc-view-decorater-oc',
            3 => 'jc-layout-item-vertical',
          ),
          'style' => 'width: auto;',
          'xpath' => '/topList_new_8',
        ),
        4 => 
        array (
          'type' => 'view',
          'id' => 'opencms_TopList_html-7',
          'cssClass' => 
          array (
            0 => 'jc-layout',
            1 => 'jc-view',
            2 => 'jc-view-decorater-oc',
            3 => 'jc-layout-item-vertical',
          ),
          'style' => 'width: auto;',
          'xpath' => '/topList_new_2',
        ),
        5 => 
        array (
          'type' => 'view',
          'id' => 'bannermanager_ViewAdvertisement_html-1',
          'cssClass' => 
          array (
            0 => 'jc-view',
            1 => 'jc-layout',
            2 => 'jc-layout-item-vertical',
          ),
          'style' => 'width: auto; padding-left: 10px;',
          'xpath' => '/107',
        ),
      ),
      'xpath' => '/org.jecat.framework.mvc.controller.WebpageFrame/frameView/frame-pos-0',
      'layout' => 'v',
    ),
  ),
  'properties' => 
  array (
    'coresystem_FrontFrame_html-0' => 
    array (
      'width' => '',
      'height' => '',
    ),
    'frame-0' => 
    array (
      'width' => '',
      'height' => '',
    ),
    'bannermanager_ViewAdvertisement_html-0' => 
    array (
      'width' => '',
      'height' => '',
      'class' => '',
      'skin' => '',
      'display' => 'block',
      'background-image' => '',
      'background-color' => '',
      'background-position' => '',
      'background-repeat' => 'no-repeat',
      'position' => 'static',
      'z-index' => '',
      'top' => '',
      'left' => '',
      'bottom' => '',
      'right' => '',
      'border-top-width' => '0',
      'border-top-color' => '#333333',
      'border-top-style' => 'none',
      'border-bottom-width' => '0',
      'border-bottom-color' => '#333333',
      'border-bottom-style' => 'none',
      'border-right-width' => '0',
      'border-right-color' => '#333333',
      'border-right-style' => 'none',
      'border-left-width' => '0',
      'border-left-color' => '#333333',
      'border-left-style' => 'none',
      'margin-top' => '',
      'margin-right' => '',
      'margin-bottom' => '',
      'margin-left' => '',
      'padding-top' => '2',
      'padding-right' => '',
      'padding-bottom' => '5',
      'padding-left' => '10',
      'style' => '',
    ),
    'opencms_TopList_html-0' => 
    array (
      'width' => '',
      'height' => '',
      'class' => 'jc-layout jc-view jc-view-decorater-oc jc-layout-item-horizontal',
    ),
    'opencms_TopList_html-1' => 
    array (
      'width' => '',
      'height' => '200',
      'class' => 'jc-layout jc-view jc-view-decorater-oc jc-layout-item-horizontal',
    ),
    'opencms_TopList_html-2' => 
    array (
      'width' => '',
      'height' => '',
      'class' => 'jc-layout jc-view jc-view-decorater-oc jc-layout-item-horizontal',
    ),
    'opencms_TopList_html-3' => 
    array (
      'width' => '',
      'height' => '',
      'class' => 'jc-layout jc-view jc-view-decorater-oc jc-layout-item-vertical',
    ),
    'opencms_TopList_html-4' => 
    array (
      'width' => '',
      'height' => '200',
      'class' => 'jc-layout jc-view jc-view-decorater-oc jc-layout-item-horizontal',
    ),
    'opencms_TopList_html-5' => 
    array (
      'width' => '',
      'height' => '200',
      'class' => 'jc-layout jc-view jc-view-decorater-oc jc-layout-item-horizontal',
    ),
    'opencms_TopList_html-6' => 
    array (
      'width' => '',
      'height' => '',
      'class' => 'jc-layout jc-view jc-view-decorater-oc jc-layout-item-horizontal',
    ),
    'opencms_TopList_html-7' => 
    array (
      'width' => '',
      'height' => '',
      'class' => 'jc-layout jc-view jc-view-decorater-oc jc-layout-item-vertical',
    ),
    'frame-1' => 
    array (
      'width' => '',
      'height' => '',
      'class' => 'jc-layout jc-frame jc-frame-vertical',
    ),
    'cusFrame-0' => 
    array (
      'class' => 'jc-layout jc-frame cusframe jc-frame-horizontal jc-layout-item-vertical',
      'width' => '',
      'height' => '',
      'autoFill' => 'true',
    ),
    'cusFrame-1' => 
    array (
      'class' => 'jc-layout jc-frame cusframe jc-frame-horizontal jc-layout-item-vertical',
      'width' => '',
      'height' => '',
      'autoFill' => 'true',
    ),
    'bannermanager_ViewAdvertisement_html-1' => 
    array (
      'width' => '',
      'height' => '',
      'class' => '',
      'skin' => '',
      'display' => 'block',
      'background-image' => '',
      'background-color' => '',
      'background-position' => '',
      'background-repeat' => 'no-repeat',
      'position' => 'static',
      'z-index' => '',
      'top' => '',
      'left' => '',
      'bottom' => '',
      'right' => '',
      'border-top-width' => '0',
      'border-top-color' => '#333333',
      'border-top-style' => 'none',
      'border-bottom-width' => '0',
      'border-bottom-color' => '#333333',
      'border-bottom-style' => 'none',
      'border-right-width' => '0',
      'border-right-color' => '#333333',
      'border-right-style' => 'none',
      'border-left-width' => '0',
      'border-left-color' => '#333333',
      'border-left-style' => 'none',
      'margin-top' => '',
      'margin-right' => '',
      'margin-bottom' => '',
      'margin-left' => '',
      'padding-top' => '',
      'padding-right' => '',
      'padding-bottom' => '',
      'padding-left' => '10',
      'style' => '',
    ),
    'cusFrame-2' => 
    array (
      'class' => 'cusframe',
      'width' => '',
      'height' => '',
      'skin' => '',
      'display' => 'block',
      'background-image' => '',
      'background-color' => '',
      'background-position' => '',
      'background-repeat' => 'no-repeat',
      'position' => 'static',
      'z-index' => '',
      'top' => '',
      'left' => '',
      'bottom' => '',
      'right' => '',
      'border-top-width' => '0',
      'border-top-color' => '#333333',
      'border-top-style' => 'none',
      'border-bottom-width' => '0',
      'border-bottom-color' => '#333333',
      'border-bottom-style' => 'none',
      'border-right-width' => '0',
      'border-right-color' => '#333333',
      'border-right-style' => 'none',
      'border-left-width' => '0',
      'border-left-color' => '#333333',
      'border-left-style' => 'none',
      'margin-top' => '',
      'margin-right' => '',
      'margin-bottom' => '',
      'margin-left' => '',
      'padding-top' => '',
      'padding-right' => '',
      'padding-bottom' => '',
      'padding-left' => '10',
      'style' => '',
    ),
  ),
));
				
		$aMessageQueue->create(Message::success,'保存配置：%s',"/merge/layout/org.opencomb.opencms.index.Index/");
			
				
		$aSetting->setItem('/merge/layout/org.opencomb.opencms.article.ArticleContent/','*',array (
  'assemble' => 
  array (
    'frame-0' => 
    array (
      'type' => 'frame',
      'id' => 'frame-0',
      'cssClass' => 
      array (
        0 => 'jc-layout',
        1 => 'jc-frame',
        2 => 'jc-frame-vertical',
      ),
      'items' => 
      array (
        0 => 
        array (
          'type' => 'view',
          'id' => 'opencms_BreadcrumbNavigation_html-0',
          'cssClass' => 
          array (
            0 => 'jc-layout',
            1 => 'jc-view',
            2 => 'jc-layout-item-vertical',
          ),
          'style' => 'width: auto; display: none;',
          'xpath' => '/mvc.controller.FrontFrame/BreadcrumbNavigation',
        ),
        1 => 
        array (
          'type' => 'view',
          'id' => 'coresystem_FrontFrame_html-0',
          'cssClass' => 
          array (
            0 => 'jc-layout',
            1 => 'jc-view',
            2 => 'jc-layout-item-vertical',
          ),
          'style' => 'width: auto;',
          'xpath' => '/mvc.controller.FrontFrame/frameView',
        ),
      ),
      'xpath' => '/mvc.controller.FrontFrame/frame-pos-0',
      'layout' => 'v',
    ),
    'frame-1' => 
    array (
      'type' => 'frame',
      'id' => 'frame-1',
      'cssClass' => 
      array (
        0 => 'jc-layout',
        1 => 'jc-frame',
        2 => 'jc-frame-vertical',
      ),
      'items' => 
      array (
        0 => 
        array (
          'type' => 'view',
          'id' => 'opencms_ArticleContent_html-0',
          'cssClass' => 
          array (
            0 => 'jc-layout',
            1 => 'jc-view',
            2 => 'jc-layout-item-vertical',
          ),
          'style' => 'width: auto;',
          'xpath' => '/',
        ),
        1 => 
        array (
          'type' => 'frame',
          'id' => 'cusFrame-1',
          'cssClass' => 
          array (
            0 => 'jc-layout',
            1 => 'jc-frame',
            2 => 'cusframe',
            3 => 'jc-frame-vertical',
            4 => 'jc-layout-item-vertical',
          ),
          'style' => 'width: auto; padding-bottom: 10px;',
          'items' => 
          array (
            0 => 
            array (
              'type' => 'view',
              'id' => 'bannermanager_ViewAdvertisement_html-0',
              'cssClass' => 
              array (
                0 => 'jc-layout',
                1 => 'jc-view',
                2 => 'jc-layout-item-vertical',
              ),
              'style' => 'width: auto;',
              'xpath' => '/随机',
            ),
          ),
          'xpath' => '/mvc.controller.FrontFrame/frameView/frame-pos-0/cusFrame-1',
          'layout' => 'v',
          'customFrame' => 'true',
        ),
        2 => 
        array (
          'type' => 'frame',
          'id' => 'cusFrame-0',
          'cssClass' => 
          array (
            0 => 'jc-layout',
            1 => 'jc-frame',
            2 => 'cusframe',
            3 => 'jc-frame-horizontal',
            4 => 'jc-layout-item-vertical',
          ),
          'style' => 'width: auto;',
          'items' => 
          array (
            0 => 
            array (
              'type' => 'view',
              'id' => 'opencms_TopList_html-0',
              'cssClass' => 
              array (
                0 => 'jc-layout',
                1 => 'jc-view',
                2 => 'jc-view-decorater-oc',
                3 => 'jc-layout-item-horizontal',
              ),
              'style' => 'width: 448px;',
              'xpath' => '/mvc.controller.FrontFrame/topListNew',
            ),
            1 => 
            array (
              'type' => 'view',
              'id' => 'opencms_TopList_html-1',
              'cssClass' => 
              array (
                0 => 'jc-layout',
                1 => 'jc-view',
                2 => 'jc-view-decorater-oc',
                3 => 'jc-layout-item-horizontal',
              ),
              'style' => 'width: 448px;',
              'xpath' => '/mvc.controller.FrontFrame/topListHot',
            ),
          ),
          'xpath' => '/mvc.controller.FrontFrame/frameView/frame-pos-0/cusFrame-0',
          'layout' => 'h',
          'customFrame' => 'true',
        ),
      ),
      'xpath' => '/mvc.controller.FrontFrame/frameView/frame-pos-0',
      'layout' => 'v',
    ),
  ),
  'properties' => 
  array (
    'opencms_BreadcrumbNavigation_html-0' => 
    array (
      'width' => '',
      'height' => '',
      'skin' => '',
      'class' => 'jc-layout-item-vertical jc-view jc-layout',
      'display' => 'none',
      'background-image' => '',
      'background-color' => '',
      'background-position' => '',
      'background-repeat' => 'no-repeat',
      'position' => 'static',
      'z-index' => '',
      'top' => '',
      'left' => '',
      'bottom' => '',
      'right' => '',
      'border-top-width' => '',
      'border-top-color' => '',
      'border-top-style' => 'none',
      'border-bottom-width' => '',
      'border-bottom-color' => '',
      'border-bottom-style' => 'none',
      'border-right-width' => '',
      'border-right-color' => '',
      'border-right-style' => 'none',
      'border-left-width' => '',
      'border-left-color' => '',
      'border-left-style' => 'none',
      'margin-top' => '',
      'margin-right' => '',
      'margin-bottom' => '',
      'margin-left' => '',
      'padding-top' => '',
      'padding-right' => '',
      'padding-bottom' => '',
      'padding-left' => '',
      'style' => '',
    ),
    'opencms_TopList_html-0' => 
    array (
      'width' => '',
      'height' => '',
      'class' => 'jc-layout jc-view jc-view-decorater-oc jc-layout-item-horizontal',
    ),
    'opencms_TopList_html-1' => 
    array (
      'width' => '',
      'height' => '',
      'class' => 'jc-layout jc-view jc-view-decorater-oc jc-layout-item-horizontal',
    ),
    'coresystem_FrontFrame_html-0' => 
    array (
      'width' => '',
      'height' => '',
    ),
    'frame-0' => 
    array (
      'width' => '',
      'height' => '',
    ),
    'opencms_ArticleContent_html-0' => 
    array (
      'width' => '',
      'height' => '',
      'class' => 'jc-layout jc-view jc-layout-item-vertical',
    ),
    'frame-1' => 
    array (
      'width' => '',
      'height' => '',
      'class' => 'jc-layout jc-frame jc-frame-vertical',
    ),
    'cusFrame-0' => 
    array (
      'class' => 'jc-layout jc-frame cusframe jc-frame-horizontal jc-layout-item-vertical',
      'width' => '',
      'height' => '',
    ),
    'bannermanager_ViewAdvertisement_html-0' => 
    array (
      'width' => '',
      'height' => '',
      'class' => 'jc-layout jc-view jc-layout-item-vertical',
    ),
    'cusFrame-1' => 
    array (
      'class' => 'jc-layout-item-vertical jc-frame-vertical cusframe jc-frame jc-layout',
      'width' => '',
      'height' => '',
      'skin' => '',
      'display' => 'block',
      'background-image' => '',
      'background-color' => '',
      'background-position' => '',
      'background-repeat' => 'no-repeat',
      'position' => 'static',
      'z-index' => '',
      'top' => '',
      'left' => '',
      'bottom' => '',
      'right' => '',
      'border-top-width' => '',
      'border-top-color' => '',
      'border-top-style' => 'none',
      'border-bottom-width' => '',
      'border-bottom-color' => '',
      'border-bottom-style' => 'none',
      'border-right-width' => '',
      'border-right-color' => '',
      'border-right-style' => 'none',
      'border-left-width' => '',
      'border-left-color' => '',
      'border-left-style' => 'none',
      'margin-top' => '',
      'margin-right' => '',
      'margin-bottom' => '',
      'margin-left' => '',
      'padding-top' => '',
      'padding-right' => '',
      'padding-bottom' => '10',
      'padding-left' => '',
      'style' => '',
    ),
  ),
));
				
		$aMessageQueue->create(Message::success,'保存配置：%s',"/merge/layout/org.opencomb.opencms.article.ArticleContent/");
			
				
		$aSetting->setItem('/merge/layout/org.opencomb.opencms.article.ArticleList/','*',array (
  'assemble' => 
  array (
    'frame-0' => 
    array (
      'type' => 'frame',
      'id' => 'frame-0',
      'cssClass' => 
      array (
        0 => 'jc-layout',
        1 => 'jc-frame',
        2 => 'jc-frame-vertical',
      ),
      'items' => 
      array (
        0 => 
        array (
          'type' => 'view',
          'id' => 'coresystem_FrontFrame_html-0',
          'cssClass' => 
          array (
            0 => 'jc-layout',
            1 => 'jc-view',
            2 => 'jc-layout-item-vertical',
          ),
          'style' => 'width: auto;',
          'xpath' => '/mvc.controller.FrontFrame/frameView',
        ),
      ),
      'xpath' => '/mvc.controller.FrontFrame/frame-pos-0',
      'layout' => 'v',
    ),
    'frame-1' => 
    array (
      'type' => 'frame',
      'id' => 'frame-1',
      'cssClass' => 
      array (
        0 => 'jc-layout',
        1 => 'jc-frame',
        2 => 'jc-frame-vertical',
      ),
      'items' => 
      array (
        0 => 
        array (
          'type' => 'view',
          'id' => 'opencms_ArticleList_html-0',
          'cssClass' => 
          array (
            0 => 'jc-layout',
            1 => 'jc-view',
            2 => 'jc-layout-item-vertical',
          ),
          'style' => 'width: auto;',
          'xpath' => '/',
        ),
        1 => 
        array (
          'type' => 'frame',
          'id' => 'cusFrame-0',
          'cssClass' => 
          array (
            0 => 'jc-layout',
            1 => 'jc-frame',
            2 => 'cusframe',
            3 => 'jc-layout-item-vertical',
            4 => 'jc-frame-vertical',
          ),
          'style' => 'width: auto; padding-top: 10px;',
          'items' => 
          array (
            0 => 
            array (
              'type' => 'view',
              'id' => 'bannermanager_ViewAdvertisement_html-0',
              'cssClass' => 
              array (
                0 => 'jc-layout',
                1 => 'jc-view',
                2 => 'jc-layout-item-vertical',
              ),
              'style' => 'width: auto;',
              'xpath' => '/banner2',
            ),
          ),
          'xpath' => '/mvc.controller.FrontFrame/frameView/frame-pos-0/cusFrame-0',
          'layout' => 'v',
          'customFrame' => 'true',
        ),
      ),
      'xpath' => '/mvc.controller.FrontFrame/frameView/frame-pos-0',
      'layout' => 'v',
    ),
  ),
  'properties' => 
  array (
    'coresystem_FrontFrame_html-0' => 
    array (
      'width' => '',
      'height' => '',
    ),
    'frame-0' => 
    array (
      'width' => '',
      'height' => '',
    ),
    'opencms_ArticleList_html-0' => 
    array (
      'width' => '',
      'height' => '',
      'class' => 'jc-layout jc-view jc-layout-item-vertical',
    ),
    'bannermanager_ViewAdvertisement_html-0' => 
    array (
      'width' => '',
      'height' => '',
      'class' => 'jc-layout jc-view jc-layout-item-vertical',
    ),
    'frame-1' => 
    array (
      'width' => '',
      'height' => '',
      'class' => 'jc-layout jc-frame jc-frame-vertical',
    ),
    'cusFrame-0' => 
    array (
      'class' => 'jc-frame-vertical jc-layout-item-vertical cusframe jc-frame jc-layout',
      'width' => '',
      'height' => '',
      'skin' => '',
      'display' => 'block',
      'background-image' => '',
      'background-color' => '',
      'background-position' => '',
      'background-repeat' => 'no-repeat',
      'position' => 'static',
      'z-index' => '',
      'top' => '',
      'left' => '',
      'bottom' => '',
      'right' => '',
      'border-top-width' => '',
      'border-top-color' => '',
      'border-top-style' => 'none',
      'border-bottom-width' => '',
      'border-bottom-color' => '',
      'border-bottom-style' => 'none',
      'border-right-width' => '',
      'border-right-color' => '',
      'border-right-style' => 'none',
      'border-left-width' => '',
      'border-left-color' => '',
      'border-left-style' => 'none',
      'margin-top' => '',
      'margin-right' => '',
      'margin-bottom' => '',
      'margin-left' => '',
      'padding-top' => '10',
      'padding-right' => '',
      'padding-bottom' => '',
      'padding-left' => '',
      'style' => '',
    ),
  ),
));
				
		$aMessageQueue->create(Message::success,'保存配置：%s',"/merge/layout/org.opencomb.opencms.article.ArticleList/");
			
				
		$aSetting->setItem('/merge/controller/','controllers',array (
));
				
		$aSetting->setItem('/merge/controller/','num',4);
				
		$aMessageQueue->create(Message::success,'保存配置：%s',"/merge/controller/");
			
				
		$aSetting->setItem('/','data-version','0.2.0');
				
		$aMessageQueue->create(Message::success,'保存配置：%s',"/");
			
		
		
		// 4. files
		
		$sFromPath = $aExtension->metainfo()->installPath()."/data/public";
		$sDestPath = $aExtension ->filesFolder()->path();
		Folder::RecursiveCopy( $sFromPath , $sDestPath );
		$aMessageQueue->create(Message::success,'复制文件夹： `%s` to `%s`',array($sFromPath,$sDestPath));
		
		$sFromPath = $aExtension->metainfo()->installPath()."/data/setup";
		$sDestPath = $aExtension->dataFolder()->path();
		Folder::RecursiveCopy( $sFromPath , $sDestPath );
		$aMessageQueue->create(Message::success,'复制文件夹： `%s` to `%s`',array($sFromPath,$sDestPath));
		
	}
}
