(function () {
	let REAL_IP = null;
	const resetOutput = () => {
		outputStatus.innerHTML = '?';
		outputMessage.innerHTML = '';
	};
	const formatOutput = (output) => {
		if (output) {
			while (output.indexOf('\n\n') >= 0) {
				output = output.trim().replaceAll('\n\n', '\n');
			}
			while (output.indexOf('  ') >= 0) {
				output = output.trim().replaceAll('  ', '&nbsp;&nbsp;');
			}
			return output.trim().replaceAll('\n', '<br />');
		}
		return '';
	};
	const showDefaultResponseStatus = (response) => {
		outputStatus.innerHTML = response.Status;
		outputMessage.innerHTML = '<div>' + formatOutput(response.Output) + '</div>';
		if (response.Status == 0) {
			outputMessage.classList.remove('error');
		} else {
			outputMessage.classList.add('error');
		}
		initGui(750);
	}
	const showDefaultExceptionStatus = (exc) => {
		outputStatus.innerHTML = '?';
		outputMessage.classList.add('error');
		outputMessage.innerHTML = '<div>' + formatOutput(exc.toString()) + '</div>';
	};
	const propertyValue = (style, property) => {
		const value = style.getPropertyValue(property).replace(/px/, '')
		return value ? Number(value) : 0;
	}
	const formatArray = (array) => {
		if (array) {
		return array.join('<br>');
		} else {
			return '';
		}
	}
	const getCommandFromButton = (button) => {
		return button.getAttribute('data-action');
	};
	const bt_Click_Open = (event) => {
		const button = event.target;
		const command = getCommandFromButton(button);
		window.open(command);
	};

	// dockerd
	const btDockerd_Click = (event) => {
		const button = event.target;
		if (button.classList.contains('pressed')) {
			dockerdStop(event);
		} else {
			dockerdStart(event);
		}
	};
	const dockerdStart = (event) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/docker-d', { command: 'start' }, dockerdStartSuccess, dockerdStartError);
	};
	const dockerdStartSuccess = (dockerdStartResponse) => {
		showDefaultResponseStatus(dockerdStartResponse);
		if (dockerdStartResponse.Status == 0) {
			btDockerd.classList.add('pressed');
		}
		showDockerAndSwarmDStatus(true, null);
	};
	const dockerdStartError = (exc) => { outputStatus.innerHTML = exc; };
	const dockerdStop = (event) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/docker-d', { command: 'stop' }, dockerdStopSuccess, dockerdStopError);
	};
	const dockerdStopSuccess = (dockerdStopResponse) => {
		showDefaultResponseStatus(dockerdStopResponse);
		if (dockerdStopResponse.Status == 0) {
			btDockerd.classList.remove('pressed');
		}
		showDockerAndSwarmDStatus(false, null);
	};
	const dockerdStopError = (exc) => { outputStatus.innerHTML = exc; };
	// /dockerd

	// swarm
	const btSwarm_Click = (event) => {
		const button = event.target;
		if (button.classList.contains('pressed')) {
			swarmLeave(event);
		} else {
			swarmInit(event);
		}
	};
	const swarmInit = (event) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/swarm', { command: 'init' }, swarmInitSuccess, swarmInitError);
	};
	const swarmInitSuccess = (swarmInitResponse) => {
		showDefaultResponseStatus(swarmInitResponse);
		if (swarmInitResponse.Status == 0) {
			btSwarm.classList.add('pressed');
		}
	};
	const swarmInitError = (exc) => { outputStatus.innerHTML = exc; };
	const swarmLeave = (event) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/swarm', { command: 'leave' }, swarmLeaveSuccess, swarmLeaveError);
	};
	const swarmLeaveSuccess = (swarmLeaveResponse) => {
		showDefaultResponseStatus(swarmLeaveResponse);
		if (swarmLeaveResponse.Status == 0) {
			btSwarm.classList.remove('pressed');
		}
	};
	const swarmLeaveError = (exc) => { outputStatus.innerHTML = exc; };
	// /swarm

	const showSettings = (apiSettingsResponse) => {
		const options = {
			border: true, headers: true, class: 'interactive settings', wrap: {
				interactions: {
					all: true, actions: true, links: true
				}, values: true, headers: true
			}, headerHandler: headerHandler
		};
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid(options, outputSettings);
		const table = gridBuilder.build(
			apiSettingsResponse.Data.Settings,
			[
		    { name: 'Name' }, { name: 'Version' }, { name: 'Ports', formatter: formatArray }, { name: 'Volumes', formatter: formatArray }, { name: 'Envs', formatter: formatArray },
				{ name: 'Scripts', formatter: (value) => value ? 'YES' : '' },
				{ name: 'NetworkMode' }
			],
			[
				{ label: 'run', handler: settingRun, enabled: (setting) => setting.Ports },
				{ label: 'build Dockerfile', handler: buildDockerfile, enabled: (setting) => setting.Dockerfile },
				{ label: 'deploy docker-compose.yml', handler: deployDockerComposeYml, enabled: (setting) => setting.DockerComposeYml }
			],
			[
				{ label: 'test IP', handler: settingTest }, { label: 'test localhost', handler: settingTestLocalhost }
			]
		);
		ellipsis(table);
	};
	const settingTest = (event, setting) => {
		event.preventDefault();
		window.open(`//${REAL_IP}:${setting.Ports[0].split(':')[0]}`);
	};
	const settingTestLocalhost = (event, setting) => {
		event.preventDefault();
		window.open(`//localhost:${setting.Ports[0].split(':')[0]}`);
	};
	const showSettingsError = (exc) => {
		io.github.crisstanza.Creator.html('span', {}, outputSettings, exc);
	};

	const showImages = (apiImagesResponse) => {
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive', wrap: { interactions: { all: true, actions: true, links: true }, values: true }, headerHandler: headerHandler }, outputImages);
		const table = gridBuilder.build(
			apiImagesResponse.Data.Images,
			[
				{ name: 'Repository' }, { name: 'Tag' }, { name: 'ImageId' }, { name: 'Created' }, { name: 'Size' }
			],
			[
				{ label: 'run', handler: imageRun, enabled: (image) => image.Tag != '<none>' },
				{ label: 'remove by repository:tag', handler: imageRemove, enabled: (image) => image.Tag != '<none>' },
				{ label: 'remove by id', handler: imageRemoveById }
			],
			[
				{ label: 'history', href: imageHistoryHref, target: '_blank' },
				{ label: 'inspect', href: imageInspectHref, target: '_blank' }
			]
		);
		ellipsis(table);
	};
	const imageHistoryHref = (image) => {
		return '/api/image/history?imageId=' + image.ImageId;
	};
	const imageInspectHref = (image) => {
		return '/api/image/inspect?imageId=' + image.ImageId;
	};

	const showImagesError = (exc) => {
		io.github.crisstanza.Creator.html('span', {}, outputImages, exc);
	};

	const imageRun = (event, image) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/image/run', { repository: image.Repository, tag: image.Tag, imageId: image.ImageId }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};
	const imageRemove = (event, image) => {
		resetOutput();
		if (confirm(`Confirm remove image "${image.Repository}:${image.Tag}"?`)) {
			const fetcher = new io.github.crisstanza.Fetcher();
			fetcher.get('/api/image/remove', { repository: image.Repository, tag: image.Tag }, showDefaultResponseStatus, showDefaultExceptionStatus);
		}
	};
	const imageRemoveById = (event, image) => {
		resetOutput();
		if (confirm(`Confirm remove image "${image.ImageId}"?`)) {
			const fetcher = new io.github.crisstanza.Fetcher();
			fetcher.get('/api/image/remove-by-id', { imageId: image.ImageId }, showDefaultResponseStatus, showDefaultExceptionStatus);
		}
	};
	const settingRun = (event, setting) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/setting/run', { name: setting.Name, version: setting.Version }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};
	const buildDockerfile = (event, image) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/build-dockerfile', { name: image.Name, version: image.Version }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};
	const deployDockerComposeYml = (event, image) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/deploy-docker-compose-yml', { name: image.Name, version: image.Version }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};
	const showStackServices = (services) => {
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'small', wrap: { values: true }, headerHandler: headerHandler });
		const grid = gridBuilder.build(
			services,
			[
				{ name: 'Id' }, { name: 'Name' }, { name: 'Mode' }, { name: "Replicas" }, { name: "Image" }, { name: "Ports" }
			]
		);
		return grid;
	};
	const showStacks = (apiStacksResponse) => {
		let needsRefresh = false;
		const checkStackTaskCurrentState = (currentState) => {
			if (currentState) {
				if (currentState.startsWith('Preparing ') || currentState.startsWith('Starting ')) {
					needsRefresh = true;
				}
			}
			return currentState;
		};
		const showStackTasks = (tasks) => {
			const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'small', wrap: { values: true }, headerHandler: headerHandler });
			const grid = gridBuilder.build(
				tasks,
				[
					{ name: 'Id' },
					{ name: 'Name' },
					{ name: 'Image' },
					{ name: 'Node' },
					{ name: 'DesiredState' },
					{ name: 'CurrentState', formatter: checkStackTaskCurrentState },
					{ name: 'Error' },
					{ name: 'Ports' }
				]
			);
			return grid;
		};
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive', headerHandler: headerHandler }, outputStacks);
		const table = gridBuilder.build(
			apiStacksResponse.Data.Stacks,
			[
				{ name: 'Name' },
				{ name: 'Services', formatter: showStackServices, class: 'parent' },
				{ name: 'Tasks', formatter: showStackTasks, class: 'parent' },
				{ name: 'Orchestrator' }
			],
			[
				{ label: 'remove', handler: stackRemove }
			]
		);
		if (needsRefresh) {
			initGui(5000);
		}
		const subTables = table.querySelectorAll('table');
		subTables.forEach(subTable => ellipsis(subTable));
	};
	const showStacksError = (exc) => { io.github.crisstanza.Creator.html('span', {}, outputStacks, exc); };
	const stackRemove = (event, stack) => {
		resetOutput();
		if (confirm(`Confirm remove stack "${stack.Name}"?`)) {
			const fetcher = new io.github.crisstanza.Fetcher();
			fetcher.get('/api/stack/remove', { name: stack.Name }, showDefaultResponseStatus, showDefaultExceptionStatus);
		}
	};

	// nodes
	const showNodes = (apiNodesResponse) => {
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive', wrap: { values: true }, headerHandler: headerHandler }, outputNodes);
		const table = gridBuilder.build(
			apiNodesResponse.Data.Nodes,
			[
				{ name: 'Id' },
				{ name: 'HostName' },
				{ name: 'Status' },
				{ name: 'Availability' },
				{ name: 'ManagerStatus' },
				{ name: 'EngineVersion' }
			],
			[],
			[
				{ label: 'inspect', href: nodeInspectHref, target: '_blank' },
			]
		);
		ellipsis(table);
	};
	const showNodesError = (exc) => { io.github.crisstanza.Creator.html('span', {}, outputNodes, exc); };
	const nodeInspectHref = (node) => { return '/api/node/inspect?id=' + cleanNodeId(node.Id); };
	const cleanNodeId = (id) => { return id.endsWith(' *') ? id.substring(0, id.length - 2) : id; };
	// /nodes

	const showInstances = (apiInstancesResponse) => {
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive', wrap: { interactions: { all: true, actions: true, links: true }, values: true }, headerHandler: headerHandler }, outputInstances);
		const table = gridBuilder.build(
			apiInstancesResponse.Data.Instances,
			[
				{ name: 'ContainerId' },
				{ name: 'Image' },
				{ name: 'Running', formatter: (value) => value ? 'YES' : 'NO' },
				{ name: "Command" },
				{ name: "Created" },
				{ name: "Status" },
				{ name: "Ports" },
				{ name: "Names" }
			],
			[
				{ label: 'start', handler: instanceStart, enabled: (instance) => !instance.Running },
				{ label: 'stop', handler: instanceStop, enabled: (instance) => instance.Running },
				{ label: 'remove', handler: instanceRemove, enabled: (instance) => !instance.Running },
				{ lineBreak: true },
				{ label: 'shell', handler: instanceSee, enabled: (instance) => instance.Running },
				{ label: 'stats', handler: instanceStatsSee },
				{ label: 'logs', handler: instanceLogsSee },
				{ label: 'scripts', handler: instanceScripts, enabled: (instance) => instance.Running && instance.Scripts },
			],
			[
				{ label: 'inspect', href: instanceInspectHref, target: '_blank' },
				{ label: 'stats', href: instanceStatsHref, target: '_blank' },
				{ label: 'logs', href: instanceLogsHref, target: '_blank' },
				{
					label: 'test',
					handler: instanceTestHandler,
					enabled: (instance) => instance.NetworkSetting && instance.NetworkSetting.Ports && instance.NetworkSetting.Ports.length && instance.NetworkSetting.BridgeIp
				}
			]
		);
		ellipsis(table);
	};
	const showInstancesError = (exc) => { io.github.crisstanza.Creator.html('span', {}, outputInstances, exc); };
	const instanceLogsHref = (instance) => { return '/api/instance/logs?containerId=' + instance.ContainerId; };
	const instanceInspectHref = (instance) => { return '/api/instance/inspect?containerId=' + instance.ContainerId; };
	const instanceStatsHref = (instance) => { return '/api/instance/stats?containerId=' + instance.ContainerId; };
	const instanceTestHandler = (event, instance) => {
		event.preventDefault();
		let panel = document.getElementById(instance.ContainerId);
		if (panel) {
			panel.parentNode.removeChild(panel);
		} else {
			const attributes = { id: instance.ContainerId, class: 'panel' };
			panel = io.github.crisstanza.Creator.html('div', attributes, event.target.parentNode);
			instance.NetworkSetting.Ports.forEach(port => {
				const url = `${instance.NetworkSetting.BridgeIp}:${port}`;
				const linkWithPort = io.github.crisstanza.Creator.html('a', { href: `//${url}`, target: '_blank' }, null, url);
				panel.append(linkWithPort);
			});
		}
	};

	const instanceStart = (event, instance) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/instance/start', { containerId: instance.ContainerId }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};
	const instanceStop = (event, instance) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/instance/stop', { containerId: instance.ContainerId }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};
	const instanceRemove = (event, instance) => {
		resetOutput();
		if (confirm(`Confirm remove instance "${instance.ContainerId}"?`)) {
			const fetcher = new io.github.crisstanza.Fetcher();
			fetcher.get('/api/instance/remove', { containerId: instance.ContainerId }, showDefaultResponseStatus, showDefaultExceptionStatus);
		}
	};

	const instanceSee = (event, instance) => { window.location.href = "/api/instance/see?containerId=" + instance.ContainerId; };
	const instanceStatsSee = (event, instance) => { window.location.href = "/api/instance/stats-see?containerId=" + instance.ContainerId; };
	const instanceLogsSee = (event, instance) => { window.location.href = "/api/instance/logs-see?containerId=" + instance.ContainerId; };
	const instanceScripts = (event, instance) => { window.location.href = "/api/instance/scripts?containerId=" + instance.ContainerId; };

	const loadSettings = () => {
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.post('/api/settings', null, showSettings, showSettingsError);
	};
	const loadImages = () => {
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.post('/api/images', null, showImages, showImagesError);
	};
	const loadInstances = () => {
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.post('/api/instances', null, showInstances, showInstancesError);
	};
	const loadStacks = () => {
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/stacks', null, showStacks, showStacksError);
	};
	const loadNodes = () => {
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/nodes', null, showNodes, showNodesError);
	};
	const loadNetworks = () => {
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/networks', null, showNetworks, showNetworksError);
	};
	const loadDiskUsages = () => {
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/disk-usages', null, showDiskUsages, showDiskUsagesError);
	};
	const loadStatus = () => {
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/status', null, showStatus, showStatusError);
	};

	// networks
	const showNetworks = (apiNetworksResponse) => {
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive', wrap: { values: true }, headerHandler: headerHandler }, outputNetworks);
		const table = gridBuilder.build(
			apiNetworksResponse.Data.Networks,
			[
				{ name: 'NetworkId' }, { name: 'Name' }, { name: 'Driver' }, { name: 'Scope' }
			],
			[
				{ label: 'remove', handler: networkRemove },
			],
			[
				{ label: 'inspect', href: networkInspectHref, target: '_blank' }
			]
		);
		ellipsis(table);
	};
	const showNetworksError = (exc) => { io.github.crisstanza.Creator.html('span', {}, outputNetworks, exc); };
	const networkInspectHref = (network) => { return '/api/network/inspect?networkId=' + network.NetworkId; };
	const networkRemove = (event, network) => {
		resetOutput();
		if (confirm(`Confirm remove network "${network.NetworkId}"?`)) {
			const fetcher = new io.github.crisstanza.Fetcher();
			fetcher.get('/api/network/remove', { networkId: network.NetworkId }, showDefaultResponseStatus, showDefaultExceptionStatus);
		}
	};
	// /networks

	// disk usage
	const showDiskUsages = (apiDiskUsagesResponse) => {
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive', wrap: { values: true }, headerHandler: headerHandler }, outputDiskUsages);
		const table = gridBuilder.build(
			apiDiskUsagesResponse.Data.DiskUsages,
			[
				{ name: 'Type' }, { name: 'Total' }, { name: 'Active' }, { name: 'Size' }, { name: 'Reclaimable' }
			],
			[
				{ label: 'prune', handler: diskUsagePrune },
			]
		);
		ellipsis(table);
	};
	const showDiskUsagesError = (exc) => { io.github.crisstanza.Creator.html('span', {}, outputDiskUsages, exc); };
	const diskUsagePrune = (event, diskUsage) => {
		resetOutput();
		if (confirm(`Confirm prune "${diskUsage.Type}"?`)) {
			const fetcher = new io.github.crisstanza.Fetcher();
			fetcher.get(`/api/${pruneType(diskUsage.Type)}/prune`, {}, showDefaultResponseStatus, showDefaultExceptionStatus);
		}
	};
	const pruneType = (diskUsageType) => {
		return pruneType[diskUsageType];
	};
	pruneType['Images'] = 'image';
	pruneType['Containers'] = 'container';
	pruneType['Local Volumes'] = 'volume';
	pruneType['Build Cache'] = 'builder';
	// /disk usage

	const showDockerAndSwarmDStatus = (statusDockerD, statusSwarm) => {
		outputMessage.classList.remove('error');
		outputMessage.innerHTML = '';
		if (statusDockerD === true) {
			outputMessage.innerHTML += '<div>DockerD is running!</div>';
			if (statusSwarm === true) {
				outputMessage.innerHTML += '<div>Swarm is initiated!</div>';
			} else if (statusSwarm === false) {
				outputMessage.innerHTML += '<div class="error">Swarm is NOT initiated!<div>';
			}
		} else if (statusDockerD === false) {
			outputMessage.innerHTML += '<div class="error">DockerD is NOT running!</div>';
		}
	};

	const showStatus = (apiStatusResponse) => {
		const status = apiStatusResponse.Data.Status;
		REAL_IP = status.Ip;
		btDockerd.removeAttribute('disabled');
		if (status.DockerD) {
			btDockerd.classList.add('pressed');
			[outputImages, outputInstances, outputStacks, outputNodes, outputNetworks, outputDiskUsages].forEach((element) => element.classList.remove('disabled'));
		} else {
			btDockerd.classList.remove('pressed');
			[outputImages, outputInstances, outputStacks, outputNodes, outputNetworks, outputDiskUsages].forEach((element) => element.classList.add('disabled'));
		}
		if (status.Swarm) {
			btSwarm.classList.add('pressed');
		} else {
			btSwarm.classList.remove('pressed');
		}
		if (outputStatus.innerText == '?') {
			showDockerAndSwarmDStatus(status.DockerD, status.Swarm);
			outputStatus.innerHTML = 0;
		}
		if (status.Update) {
			newVersionMessage.setAttribute('update', 'true');
			latestVersion.innerText = status.NewVersion;
		} else {
			newVersionMessage.removeAttribute('update');
			latestVersion.innerText = '?';
		}
	};
	const showStatusError = (exc) => {
		outputStatus.innerHTML = exc;
	};

	const window_Resize = (event) => {
		initGui(0);
	}

	const headerHandler = (event, th, i) => {
		const half = th.clientWidth / 2;
		const table = th.parentNode.parentNode.parentNode;
		if (event.offsetX < half) {
			decreaseColumnWidth(i, table);
		} else {
			increaseColumnWidth(i, table);
		}
	};

	const changeColumnWidth = (currentHeader, table, mult) => {
		const header = table.tHead.rows[0].cells[currentHeader];
		const newWidth = header.getBoundingClientRect().width * mult + 'px';
		header.style.width = newWidth;
		const rows = table.tBodies[0].rows;
		for (let currentRow = 0; currentRow < rows.length; currentRow++) {
			const row = rows[currentRow];
			const cell = row.cells[currentHeader];
			const div = cell.querySelector(':scope > div');
			if (div) {
				div.style.width = newWidth;
			} else {
				//cell.style.width = newWidth;
			}
		}
	};
	const decreaseColumnWidth = (i, table) => {
		changeColumnWidth(i, table, 0.8);
	};
	const increaseColumnWidth = (i, table) => {
		changeColumnWidth(i, table, 1.2);
	};

	const ellipsis = (table) => {
		const ths = Array.from(table.querySelectorAll('thead > tr > th'));
		const headerWidths = ths.map(th => {
			const style = getComputedStyle(th, null);
			const paddingLeft = propertyValue(style, 'padding-left');
			const paddingRight = propertyValue(style, 'padding-right');
			return Math.trunc(th.getBoundingClientRect().width) - paddingLeft - paddingRight;
		});
		const rows = table.querySelectorAll('tbody > tr');
		rows.forEach(row => {
			const cells = row.querySelectorAll('td');
			cells.forEach((cell, i) => {
				const div = cell.querySelector('div');
				if (div) {
					const th = ths[i];
					if (div.innerText.length >= th.innerText.length) {
						const style = getComputedStyle(cell, null);
						const paddingLeft = propertyValue(style, 'padding-left');
						const paddingRight = propertyValue(style, 'padding-right');
						const newWidth = (headerWidths[i] - paddingLeft - paddingRight) + 'px';
						div.title = div.innerText;
						div.style.width = newWidth;
						th.style.width = newWidth;
					} else {
						//const span = th.querySelector('span');
						//if (span) {
						//	const style = getComputedStyle(span, null);
						//	const paddingLeft = propertyValue(style, 'padding-left');
						//	const paddingRight = propertyValue(style, 'padding-right');
						//	const width = (Math.trunc(span.getBoundingClientRect().width) - paddingLeft - paddingRight) + 'px';
						//	th.style.width = width;
						//	cell.style.width = width;
						//}
						div.style.width = '100%';
					}
				}
			});
		});
	}

	const initGui = (delay) => {
		setTimeout(() => {
			loadSettings();
			loadImages();
			loadInstances();
			loadStacks();
			loadNodes();
			loadNetworks();
			loadDiskUsages();
			loadStatus();
		}, delay);
	};

	const initListeners = () => {
		const buttons = document.querySelectorAll('button[data-target=_blank]');
		buttons.forEach((button) => button.addEventListener('click', bt_Click_Open));
		btDockerd.addEventListener('click', btDockerd_Click);
		btSwarm.addEventListener('click', btSwarm_Click);
		window.addEventListener('resize', window_Resize)
	};
	const init = () => {
		initGui(100);
		initListeners();
	};

	window.addEventListener('load', init);
})();
