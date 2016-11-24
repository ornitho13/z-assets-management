<?php

$copyTask = new CopyTask();
$copyTask->setConfiguration($argv[2]);
$copyTask->setPath($argv[3]);
$copyTask->run($argv[1], $argv[4]);


class CopyTask {
    private $path = null;
    private $configuration = null;

    public function __construct()
    {

    }

    public function run($type, $file = null)
    {
        if (strval($type) === 'js') {
            //parse dir
            if ($file !== null ) {
                $mainFiles = explode(',', $this->configuration['ofa.files'][strval($file)]);
                $fileDestination = strval($file) . '.js';
                $this->jsCssAssemble($fileDestination, $mainFiles);
            } else {
                foreach($this->configuration['ofa.files'] as $key => $mainFiles) {
                    $mainFiles = explode(',', $mainFiles);
                    $fileDestination = $key . '.js';
                    $this->jsCssAssemble($fileDestination,  $mainFiles);
                }
                //otherfile
                $fileToCopy = explode(',', $this->configuration['ofa.fileToCopy']);
                foreach ($fileToCopy as $key => $file) {
                    $contentMain = file_get_contents(dirname(__FILE__) . '/../js/'.$file);
                    $file = preg_replace('`^.*?\/(.*)\.js`', '$1.js', $file);
                    file_put_contents(dirname(__FILE__) . '/../js/build/' . $file, $contentMain);
                }
            }
        }

        if (strval($type) === 'css') {
            //css part
            if ($file !== null ) {
                $fileDestination = strval($file) . '.scss';
                $mainFiles = explode(',', $this->configuration['ofa.css'][strval($file)]);
                $this->jsCssAssemble($fileDestination, $mainFiles, 'css', 'src/');
            } else {
                foreach ($this->configuration['ofa.css'] as $key => $mainFiles) {
                    $fileDestination = $key . '.scss';
                    $mainFiles = explode(',', $mainFiles);
                    $this->jsCssAssemble($fileDestination , $mainFiles, 'css', 'src/');
                }
            }
        }
    }

    public function setConfiguration($configuration = null)
    {
        if ($configuration !== null) {
            $this->configuration = parse_ini_file($configuration . '/configuration.ini');
        }
    }

    public function setPath($path = null)
    {
        if ($path !== null) {
            $this->path = $path;
        }
    }

    private function jsCssAssemble($fileDestination, $mainFiles, $type = 'js', $src = '') {
        $contentMain = '';
        foreach($mainFiles as $file){
            if ($type === 'js') {
                $content = file_get_contents($this->path . $type . '/' . $file);
                var_dump(dirname(__FILE__) . '/../' . $type . '/' . $file);
                if (preg_match_all('`require\s\'(.*)\'`', $content, $matches)) {
                    $contentMain .= $this->recursiveRequire($content, $matches, $type);
                } else {
                    $contentMain .= file_get_contents($this->path . $type . '/' . $file);
                }
            } else {
                $contentMain .= file_get_contents($this->path . $type . '/' . $file) . PHP_EOL;
            }
        }
        file_put_contents($this->path . $type . '/build/' . $src . $fileDestination, $contentMain);
    }

    private function recursiveRequire($data, $matchesInside, $type) {
        foreach ($matchesInside[1] as $key => $value) {
            $jsContentFromRequireFile = file_get_contents($this->path . $type . '/' . $value);
            // fix issue on parameters in regex JS
            $jsContentFromRequireFile = str_replace('$1', '@1', $jsContentFromRequireFile);
            $jsContentFromRequireFile = str_replace('$2', '@2', $jsContentFromRequireFile);
            $jsContentFromRequireFile = str_replace('$3', '@3', $jsContentFromRequireFile);
            $jsContentFromRequireFile = str_replace('$4', '@4', $jsContentFromRequireFile);
            $jsContentFromRequireFile = str_replace('$5', '@5', $jsContentFromRequireFile);
            $jsContentFromRequireFile = str_replace('$6', '@6', $jsContentFromRequireFile);
            $jsContentFromRequireFile = str_replace('$7', '@7', $jsContentFromRequireFile);

            $data = preg_replace('`require\s\'' . $value . '\'`', addcslashes($jsContentFromRequireFile, '\\'), $data);

            $data = str_replace('@1', '$1', $data);
            $data = str_replace('@2', '$2', $data);
            $data = str_replace('@3', '$3', $data);
            $data = str_replace('@4', '$4', $data);
            $data = str_replace('@5', '$5', $data);
            $data = str_replace('@6', '$6', $data);
            $data = str_replace('@7', '$7', $data);

            if (preg_match_all('`require\s\'(.*)\'`', $data, $matches)) {
                $data = $this->recursiveRequire($data, $matches, $type);
            }
        }
        return $data;

    }
}
