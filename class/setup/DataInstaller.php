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
// create data installer 模块版本：1.0.10.0

class DataInstaller implements IExtensionDataInstaller
{
	public function install(MessageQueue $aMessageQueue,ExtensionMetainfo $aMetainfo)
	{
		$aExtension = new Extension($aMetainfo);
		
		// 1 . create data table
		
		
		
		// 2. insert table data
		
		
		// 3. settings
		
		$aSetting = $aExtension->setting() ;
			
				
		$aSetting->setItem('/merge/controller/','controllers',array (
));
				
		$aMessageQueue->create(Message::success,'保存配置：%s',"/merge/controller/");
			
				
		$aSetting->setItem('/merge/','skin',array (
  '蜂巢默认皮肤' => 
  array (
    'width' => '',
    'height' => '',
    'class' => 'jc-layout jc-view jc-view-decorater-oc jc-layout-item-horizontal',
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
    'border-top-width' => '1',
    'border-top-color' => '#dfdfdf',
    'border-top-style' => 'solid',
    'border-bottom-width' => '1',
    'border-bottom-color' => '#dfdfdf',
    'border-bottom-style' => 'solid',
    'border-right-width' => '1',
    'border-right-color' => '#dfdfdf',
    'border-right-style' => 'solid',
    'border-left-width' => '1',
    'border-left-color' => '#dfdfdf',
    'border-left-style' => 'solid',
    'margin-top' => '0',
    'margin-right' => '10',
    'margin-bottom' => '15',
    'margin-left' => '10',
    'padding-top' => '10',
    'padding-right' => '10',
    'padding-bottom' => '10',
    'padding-left' => '10',
    'style' => 'border-radius:2px; box-shadow:0 0 4px rgba(0,0,0,0.1)',
  ),
));
				
		$aMessageQueue->create(Message::success,'保存配置：%s',"/merge/");
			
		
		
		// 4. files
		
	}
}
