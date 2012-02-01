<?php
namespace org\opencomb\mvcmerger\struct ;

use org\jecat\framework\mvc\controller\Controller;
use org\jecat\framework\mvc\controller\WebpageFrame;
use org\opencomb\coresystem\mvc\controller\ControlPanel;

class StructBrowser extends ControlPanel
{
	public function createBeanConfig()
	{
		return array(
			'view:browser'=>array(
				'template' => 'StructBrowser.html' ,
			) ,
		) ;
	}

    protected function defaultFrameConfig()
    {
    	return Controller::defaultFrameConfig() ;
    }

	public function process()
	{}
}
