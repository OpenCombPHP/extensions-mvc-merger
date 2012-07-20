<?php
namespace org\opencomb\mvcmerger\upgrader ;

use org\opencomb\platform\service\Service;
use org\opencomb\platform\service\ServiceSerializer;
use org\opencomb\mvcmerger\MvcMerger;
use org\jecat\framework\system\Application;
use org\opencomb\platform\ext\IExtensionDataUpgrader;
use org\jecat\framework\util\Version;
use org\jecat\framework\message\MessageQueue;
use org\opencomb\platform\ext\ExtensionMetainfo;

class Upgrader02 implements IExtensionDataUpgrader{
	public function upgrade(MessageQueue $aMessageQueue,Version $aFromVersion , ExtensionMetainfo $aMetainfo){
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		$arrMergedControllers = $aSetting->item('/merge/controller','controllers',array()) ;
		
		foreach($arrMergedControllers as $sControllerName => &$arrControllerSetting){
			foreach ($arrControllerSetting as $sSaveType => &$arrSetting){
				foreach ($arrSetting as $nKey => &$arrSigleSetting){
					$arrSigleSetting['mergeType'] = 'page';
					$arrSigleSetting['enable'] = true;
				}
			}
			
			// 清理类编译缓存
			MvcMerger::clearClassCompiled( $sControllerName ) ;
		}
		
		$aSetting->setItem('/merge/controller','controllers',$arrMergedControllers) ;
		
		// 清理平台缓存
		ServiceSerializer::singleton()->clearRestoreCache(Service::singleton());
	}
}