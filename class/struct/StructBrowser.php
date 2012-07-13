<?php
namespace org\opencomb\mvcmerger\struct ;

use org\opencomb\coresystem\auth\Id;
use org\jecat\framework\mvc\controller\Controller;
use org\opencomb\coresystem\mvc\controller\ControlPanel;

class StructBrowser extends ControlPanel
{
	protected $arrConfig = array(
		'title'=>'浏览模板编制项',
		'view'=>array(
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

	public function process()
	{
		$sUrl = $this->params['url'];
		$sSelectType = $this->params['selectType'];// 'handle'
		$sAllowSelectClass = $this->params['allowSelectClass'];// 'c'
		
		$this->view()->variables()->set('sUrl',$sUrl);
		$this->view()->variables()->set('sSelectType',$sSelectType);
		$this->view()->variables()->set('sAllowSelectClass',$sAllowSelectClass);
	}
    protected function defaultFrameConfig()
    {
    	return Controller::defaultFrameConfig() ;
    }
}