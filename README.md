# FullPages
一款jQuery全屏滚动插件

默认参数配置：

```
$.fn.FullPages.defaults = {
		selectors: {
			sections: ".sections",
			section: ".section",
			page: ".pages",
			active: ".active",
		},
		index: 0,                // 页面开始的索引
		easing: "ease",          // 动画效果
		duration: 500,           // 动画执行时间
		loop: false,             // 是否循环切换
		pagination: true,        // 是否进行分页
		keyboard: true,          // 是否触发键盘事件
		direction: "vertical",   // 滑动方向vertical,horizontal
		callback: ""             // 回调函数
	};
  ```
  
  自定义参数配置：
  
  ```
  <script type="text/javascript">
		$("#container").FullPages({
			direction : "horizontal"
		});
	</script>
  ```
