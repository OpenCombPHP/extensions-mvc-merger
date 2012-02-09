<?php
namespace org\opencomb\mvcmerger\struct ;

use org\opencomb\coresystem\auth\Id;

use org\jecat\framework\mvc\controller\Controller;
use org\jecat\framework\mvc\controller\WebpageFrame;
use org\opencomb\coresystem\mvc\controller\ControlPanel;

class StructBrowser extends ControlPanel
{
	public function createBeanConfig()
	{
		return array(
			'title'=>'浏览模板编制项',
			'view:browser'=>array(
				'template' => 'StructBrowser.html' ,
			) ,
			'perms' => array(
				// 权限类型的许可
				'perm.purview'=>array(
					'namespace'=>'coresystem',
					'name' => Id::PLATFORM_ADMIN,
				) ,
			) ,
		) ;
	}

	public function process()
	{
		$this->checkPermissions('您没有使用这个功能的权限,无法继续浏览',array()) ;
	}
    protected function defaultFrameConfig()
    {
    	return Controller::defaultFrameConfig() ;
    }

}
