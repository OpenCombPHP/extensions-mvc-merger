<?php
namespace org\opencomb\mvcmerger\merger ;

use org\jecat\framework\ui\xhtml\UIFactory;

use org\opencomb\coresystem\lib\LibManager;

use org\jecat\framework\resrc\HtmlResourcePool;

use org\jecat\framework\io\IOutputStream;

use org\jecat\framework\mvc\view\View;
use org\jecat\framework\lang\Object;
use org\jecat\framework\mvc\controller\Controller;

class MergePannel extends Object
{
	public function __construct(View $aView)
	{
		$this->findView( $aView, $this->arrViewTreeRoot ) ;
		// print_r($this->arrViewTreeRoot) ;
	}

	protected function findView(View $aView,& $arrView)
	{
		//echo $aView->id() ,"<br />\r\n" ;
		$arrView = array(
				'id' => $aView->id() ,
				'eleId' => 'layout-item-'.$aView->id() ,
				'xpath' => $aView->xpath(true) ,
				'name' => $aView->name() ,
				'template' => $aView->template() ,
				'children' => array() ,
		) ;
		
		foreach($aView->iterator() as $aChild)
		{
			if( $aChild->parent()===$aView )
			{
				$this->findView($aChild,$arrChildView) ;
				$arrView['children'][] = $arrChildView ;
			}
		}
	}
	
	public function output(IOutputStream $aDevice)
	{
		UIFactory::singleton()->create()->display('mvc-merger:MergePannelDialog.html',null,$aDevice) ;
		$aDevice->write(HtmlResourcePool::singleton()->__toString()) ;
		
		$aDevice->write("<script>\r\n") ;
		$aDevice->write("jquery(document).ready(function(){\r\n") ;
		$aDevice->write("	var mergerpannel = new MergerPannel() ;\r\n") ;
		$aDevice->write('	mergerpannel.viewTree = '.json_encode($this->arrViewTreeRoot)." ;\r\n") ;
		$aDevice->write("	mergerpannel.init() ;\r\n") ;
		$aDevice->write("}) ;") ;
		$aDevice->write("</script>\r\n") ;
	}

	private $arrViewTreeRoot = array() ;
}

?>