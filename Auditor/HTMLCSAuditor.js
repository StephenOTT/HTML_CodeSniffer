var HTMLCSAuditor = new function()
{
    var _prefix   = 'HTMLCS-';
    var _screen   = '';
    var _standard = '';
    var _source   = '';
    var _options  = {};
    var _messages = [];
    var _page     = 1;

    /**
     * Build the "summary section" square button.
     *
     * @return {HTMLDivElement}
     */
    var buildSummaryButton = function(id, className, title, onclick) {
        var button       = document.createElement('div');
        button.id        = id;
        button.className = _prefix + 'button';
        button.setAttribute('title', title);

        var buttonInner       = document.createElement('span');
        buttonInner.className = _prefix + 'button-icon ' + className;
        button.appendChild(buttonInner);

        var nbsp = document.createTextNode(String.fromCharCode(160));
        button.appendChild(nbsp);

        if ((onclick instanceof Function) === true) {
            button.onclick = function() {
                if (/disabled/.test(button.className) === false) {
                    onclick();
                }
            };
        }

        return button;
    };

    /**
     * Build a checkbox.
     *
     * @return {HTMLDivElement}
     */
    var buildCheckbox = function(id, title, checked) {
        if (checked === undefined) {
            checked = false;
        }

        var div       = document.createElement('div');
        div.className = _prefix + 'checkbox';

        var span       = document.createElement('span');
        span.className = 'input-container';
        div.appendChild(span);

        var input     = document.createElement('input');
        input.id      = id;
        input.checked = checked;
        input.setAttribute('type', 'checkbox');
        span.appendChild(input);

        var label       = document.createElement('label');
        label.innerHTML = title;
        label.setAttribute('for', input.id);
        div.appendChild(label);

        return div;
    };

    /**
     * Build a radio button.
     *
     * @return {HTMLDivElement}
     */
    var buildRadioButton = function(groupName, value, title, checked) {
        if (checked === undefined) {
            checked = false;
        }

        var div       = document.createElement('div');
        div.className = _prefix + 'radio';

        var span       = document.createElement('span');
        span.className = 'input-container';
        div.appendChild(span);

        var input     = document.createElement('input');
        input.id      = _prefix + '-' + groupName + '-' + value;
        input.name    = groupName;
        input.checked = checked;
        input.setAttribute('type', 'radio');
        span.appendChild(input);

        var label       = document.createElement('label');
        label.innerHTML = title;
        label.setAttribute('for', input.id);
        div.appendChild(label);

        return div;
    };

    /**
     * Build the "message box" interface.
     *
     * This is displayed while the tests are running.
     *
     * @return {HTMLDivElement}
     */
    var buildMessageBox = function(text) {
        var runningDiv       = document.createElement('div');
        runningDiv.className = _prefix + 'message-box';
        runningDiv.innerHTML = text;

        return runningDiv;
    };

    /**
     * Build the header section at the absolute top of the interface.
     *
     * @return {HTMLDivElement}
     */
    var buildHeaderSection = function(standard) {
        var header       = document.createElement('div');
        header.className = _prefix + 'header';
        header.innerHTML = 'Accessibility Auditor - ' + standard;

        return header;
    };

    /**
     * Build the summary section of the interface.
     *
     * This includes the number of errors, warnings and notices; as well as buttons
     * to access the settings interface, and to recheck the content.
     *
     * @return {HTMLDivElement}
     */
    var buildSummarySection = function(errors, warnings, notices) {
        var self = this;

        var summary       = document.createElement('div');
        summary.className = _prefix + 'summary';

        var leftPane       = document.createElement('div');
        leftPane.className = _prefix + 'summary-left';
        summary.appendChild(leftPane);

        var rightPane       = document.createElement('div');
        rightPane.className = _prefix + 'summary-right';
        summary.appendChild(rightPane);

        var leftContents = [];
        var divider      = '<span class="' + _prefix + 'divider"></span>';

        if (errors > 0) {
            var typeName = 'Errors';
            if (errors === 1) {
                typeName = 'Error';
            }
            leftContents.push('<strong>' + errors + '</strong> ' + typeName);
        }

        if (warnings > 0) {
            var typeName = 'Warnings';
            if (warnings === 1) {
                typeName = 'Warning';
            }
            leftContents.push('<strong>' + warnings + '</strong> ' + typeName);
        }

        if (notices > 0) {
            var typeName = 'Notices';
            if (notices === 1) {
                typeName = 'Notice';
            }
            leftContents.push('<strong>' + notices + '</strong> ' + typeName);
        }

        if (leftContents.length === 0) {
            leftPane.innerHTML = 'No errors found';
        } else {
            leftPane.innerHTML = leftContents.join(divider);
        }

        rightPane.appendChild(buildSummaryButton(_prefix + 'button-settings', 'settings', 'Audit Settings', function() {
            if (_screen === 'settings') {
                HTMLCSAuditor.changeScreen('issue-list');
            } else {
                HTMLCSAuditor.changeScreen('settings');
            }
        }));
        rightPane.appendChild(buildSummaryButton(_prefix + 'button-rerun', 'refresh', 'Re-run Audit', function() {
            HTMLCSAuditor.run(_standard, _source);
        }));

        return summary;
    };

    /**
     * Build the summary section of the interface.
     *
     * This includes the number of errors, warnings and notices; as well as buttons
     * to access the settings interface, and to recheck the content.
     *
     * @return {HTMLDivElement}
     */
    var buildDetailSummarySection = function(issue, totalIssues) {
        var self = this;

        var summary       = document.createElement('div');
        summary.className = _prefix + 'summary';

        var leftPane       = document.createElement('div');
        leftPane.className = _prefix + 'summary-left';
        summary.appendChild(leftPane);

        var rightPane       = document.createElement('div');
        rightPane.className = _prefix + 'summary-right';
        summary.appendChild(rightPane);

        var showList       = document.createElement('a');
        showList.className = _prefix + 'back-home';
        showList.href      = 'javascript:';
        showList.innerHTML = 'Home';
        leftPane.appendChild(showList);

        leftPane.innerHTML += '<span class="' + _prefix + 'issue-nav-divider"></span>';
        leftPane.innerHTML += 'Issue ' + issue + ' of ' + totalIssues;

        rightPane.appendChild(buildSummaryButton(_prefix + 'button-settings', 'previous', 'Previous Issue', function() {
            wrapper = summary.parentNode;
            var newSummary = buildDetailSummarySection(Number(issue) - 1, totalIssues);
            wrapper.replaceChild(newSummary, summary);

            var issueList = document.getElementsByClassName('HTMLCS-issue-detail-list')[0];
            issueList.style.marginLeft = (parseInt(issueList.style.marginLeft, 10) + 35) + 'em';
        }));

        rightPane.appendChild(buildSummaryButton(_prefix + 'button-rerun', 'next', 'Next Issue', function() {
            wrapper = summary.parentNode;
            var newSummary = buildDetailSummarySection(Number(issue) + 1, totalIssues);
            wrapper.replaceChild(newSummary, summary);

            var issueList = document.getElementsByClassName('HTMLCS-issue-detail-list')[0];
            issueList.style.marginLeft = (parseInt(issueList.style.marginLeft, 10) - 35) + 'em';
        }));

        return summary;
    };

    /**
     * Build the main issue list section of the interface.
     *
     * This is what you see when the tests have finished running. A summary list of
     * , paged five at a time.
     *
     * @return {HTMLDivElement}
     */
    var buildIssueListSection = function(messages) {
        var issueListWidth = (Math.ceil(messages.length / 5) * 35);
        var issueList      = document.createElement('div');
        issueList.id        = _prefix + 'issues';
        issueList.className = _prefix + 'details';
        issueList.setAttribute('style', 'width: ' + issueListWidth + 'em');

        var listSection = document.createElement('ol');
        listSection.className = _prefix + 'issue-list';
        listSection.setAttribute('style', 'margin-left: 0');

        for (var i = 0; i < messages.length; i++) {
            if ((i > 0) && ((i % 5) === 0)) {
                issueList.appendChild(listSection);
                var listSection = document.createElement('ol');
                listSection.className = _prefix + 'issue-list';
            }

            var msg = buildMessageSummary(i, messages[i]);
            listSection.appendChild(msg);
        }

        issueList.appendChild(listSection);

        return issueList;
    };

    var buildIssueDetailSection = function(messages) {
        var issueListWidth  = (messages.length * 35);
        var issueList       = document.createElement('div');
        issueList.id        = _prefix + 'issues-detail';
        issueList.className = _prefix + 'details';
        issueList.setAttribute('style', 'width: ' + issueListWidth + 'em');

        var listSection = document.createElement('ol');
        listSection.className = _prefix + 'issue-detail-list';
        listSection.setAttribute('style', 'margin-left: 0');

        for (var i = 0; i < messages.length; i++) {
            listSection.innerHTML += buildMessageDetail(i, messages[i]);
        }

        issueList.appendChild(listSection);

        return issueList;
    };

    var buildSettingsSection = function() {
        var settingsDiv       = document.createElement('div');
        settingsDiv.className = _prefix + 'settings';

        var listFiltersDiv = document.createElement('div');
        listFiltersDiv.id  = _prefix + 'settings-list-filters';
        settingsDiv.appendChild(listFiltersDiv);

        var listFiltersHdr       = document.createElement('h1');
        listFiltersHdr.innerHTML = 'List Filters';
        listFiltersDiv.appendChild(listFiltersHdr);

        var listFiltersExp       = document.createElement('p');
        listFiltersExp.innerHTML = 'Errors and Warnings are always shown and cannot be hidden. Notices will be automatically shown if there are not other issues.';
        listFiltersDiv.appendChild(listFiltersExp);

        var showNoticesCheckbox = buildCheckbox(_prefix + 'include-notices', 'Always include Notices');
        listFiltersDiv.appendChild(showNoticesCheckbox);

        var useStandardDiv = document.createElement('div');
        useStandardDiv.id = _prefix + 'settings-use-standard';
        settingsDiv.appendChild(useStandardDiv);

        var useStandardHdr       = document.createElement('h1');
        useStandardHdr.innerHTML = 'Accessibility Standard';
        useStandardDiv.appendChild(useStandardHdr);

        var useStandardExp       = document.createElement('p');
        useStandardExp.innerHTML = 'Choose which standard you would like to check your content against.';
        useStandardDiv.appendChild(useStandardExp);

        var radioButton = buildRadioButton('standard', 'WCAG2AAA', 'WCAG 2.0 AAA');
        useStandardDiv.appendChild(radioButton);

        var radioButton = buildRadioButton('standard', 'WCAG2AA', 'WCAG 2.0 AA');
        useStandardDiv.appendChild(radioButton);

        var radioButton = buildRadioButton('standard', 'WCAG2A', 'WCAG 2.0 A');
        useStandardDiv.appendChild(radioButton);

        var recheckDiv = document.createElement('div');
        recheckDiv.id  = _prefix + 'settings-recheck';
        settingsDiv.appendChild(recheckDiv);

        var recheckButton       = document.createElement('button');
        recheckButton.id        = _prefix + 'recheck-content';
        recheckButton.className = _prefix + 'button';
        recheckButton.innerHTML = 'Re-check Content';
        recheckButton.onclick   = function() {
            HTMLCSAuditor.run(_standard);
        };
        recheckDiv.appendChild(recheckButton);

        return settingsDiv;
    };

    var buildMessageSummary = function(id, message) {
        var msg       = '';
        var typeText  = '';
        var typeClass = '';

        switch (message.type) {
            case HTMLCS.ERROR:
                typeText = 'Error';
            break;

            case HTMLCS.WARNING:
                typeText = 'Warning';
            break;

            case HTMLCS.NOTICE:
                typeText = 'Notice';
            break;

            default:
                // Not defined.
            break;
        }//end switch

        var typeClass  = typeText.toLowerCase();
        var messageMsg = message.msg;
        if (messageMsg.length > 130) {
            messageMsg = messageMsg.substr(0, 127) + '...';
        }

        var msg = document.createElement('li');
        msg.id  = _prefix + 'msg-' + id;

        var typeIcon       = document.createElement('span');
        typeIcon.className = _prefix + 'issue-type ' + typeClass;
        typeIcon.setAttribute('title', typeText);
        msg.appendChild(typeIcon);

        var msgTitle       = document.createElement('span');
        msgTitle.className = _prefix + 'issue-title';
        msgTitle.innerHTML = messageMsg;
        msg.appendChild(msgTitle);

        msg.onclick = function() {
            var id   = this.id.replace(new RegExp(_prefix + 'msg-'), '');

            var detailList = document.getElementById(_prefix + 'issues-detail-wrapper');
            detailList.className += ' transition-disabled';

            var list = document.getElementsByClassName('HTMLCS-issue-detail-list')[0];
            list.style.marginLeft = ((id - 1) * -35) + 'em';
            detailList.className = detailList.className.replace(/ transition-disabled/, '');

            var list = document.getElementsByClassName('HTMLCS-inner-wrapper')[0];
            list.style.marginLeft = '-35em';

            var list = document.getElementById('HTMLCS-issues-wrapper');
            list.style.display = 'none';

            summary = document.getElementsByClassName('HTMLCS-summary')[0];
            var newSummary = buildDetailSummarySection(id + 1, _messages.length);
            summary.parentNode.replaceChild(newSummary, summary);
        }

        return msg;
    };

    var buildMessageDetail = function(id, message, standard) {
        var msg       = '';
        var typeText  = '';

        var principles = {
            'Principle1': {
                name: 'Perceivable',
                link: 'http://www.w3.org/TR/WCAG20/#perceivable'
               },
            'Principle2': {
                name: 'Operable',
                link: 'http://www.w3.org/TR/WCAG20/#operable'
               },
            'Principle3': {
                name: 'Understandable',
                link: 'http://www.w3.org/TR/WCAG20/#understandable'
               },
            'Principle4': {
                name: 'Robust',
                link: 'http://www.w3.org/TR/WCAG20/#robust'
               }
        }

        switch (message.type) {
            case HTMLCS.ERROR:
                typeText = 'Error';
            break;

            case HTMLCS.WARNING:
                typeText = 'Warning';
            break;

            case HTMLCS.NOTICE:
                typeText = 'Notice';
            break;

            default:
                // Not defined.
            break;
        }//end switch

        var typeClass     = typeText.toLowerCase();
        var msgCodeParts  = message.code.split('.', 5);
        var principle     = msgCodeParts[1];
        var techniques    = msgCodeParts[4].split(',');
        var techniquesStr = [];

        for (var i = 0; i < techniques.length; i++) {
            techniques[i]  = techniques[i].split('.');
            techniquesStr.push('<a href="http://www.w3.org/TR/WCAG20-TECHS/' + techniques[i][0] + '">' + techniques[i][0] + '</a>');
        }

        msg += '<li id="HTMLCS-msg-detail-' + id + '"><div>';
        msg += '<span class="HTMLCS-issue-type ' + typeClass + '" title="' + typeText + '"></span>';
        msg += '<div class="HTMLCS-issue-title">' + message.msg + '</div>';
        msg += '<div class="HTMLCS-issue-wcag-ref">';
        msg += '<em>Principle:</em> <a href="' + principles[principle].link + '">' + principles[principle].name + '</a><br/>';
        msg += '<em>Technique:</em> ' + techniquesStr.join(' '); + '<br/>';
        msg += '</div>';
        msg += '</div></li>';

        return msg;
    };

    var buildNavigation = function(page, totalPages) {
        var navDiv       = document.createElement('div');
        navDiv.className = _prefix + 'navigation';

        var prev       = document.createElement('span');
        prev.className = _prefix + 'nav-button previous';
        prev.innerHTML = String.fromCharCode(160);

        if (page === 1) {
            prev.className += ' disabled';
        }

        navDiv.appendChild(prev);

        var pageNum       = document.createElement('span');
        pageNum.className = _prefix + 'page-number';
        pageNum.innerHTML = 'Page ' + page + ' of ' + totalPages;
        navDiv.appendChild(pageNum);

        var next       = document.createElement('span');
        next.className = _prefix + 'nav-button next';
        next.innerHTML = String.fromCharCode(160);

        if (page === totalPages) {
            next.className += ' disabled';
        }

        navDiv.appendChild(next);

        prev.onclick = function() {
            if (_page > 1) {
                _page--;
                if (_page === 1) {
                    prev.className += ' disabled';
                }
            }

            next.className    = next.className.replace(/ disabled/, '');
            pageNum.innerHTML = 'Page ' + _page + ' of ' + totalPages;

            var issueList = document.getElementsByClassName('HTMLCS-issue-list')[0];
            issueList.style.marginLeft = ((_page - 1) * -35) + 'em';
        }

        next.onclick = function() {
            if (_page < totalPages) {
                _page++;
                if (_page === totalPages) {
                    next.className += ' disabled';
                }
            }

            prev.className    = prev.className.replace(/ disabled/, '');
            pageNum.innerHTML = 'Page ' + _page + ' of ' + totalPages;

            var issueList = document.getElementsByClassName('HTMLCS-issue-list')[0];
            issueList.style.marginLeft = ((_page - 1) * -35) + 'em';
        }

        return navDiv;
    }

    this.build = function(standard, messages, options) {
        if (options.alwaysShowNotices === undefined) {
            options.alwaysShowNotices = false;
        }

        if (options.initialScreen === undefined) {
            options.initialScreen = 'settings';
        }

        // Restack the messages so they are sorted by message type.
        var showNotices = true;
        for (var i = 0; i < messages.length; i++) {
            if (messages[i].type !== HTMLCS.NOTICE) {
                showNotices = options.alwaysShowNotices;
                break;
            }//end if
        }//end if

        var errors   = 0;
        var warnings = 0;
        var notices  = 0;

        for (i = 0; i < messages.length; i++) {
            switch (messages[i].type) {
                case HTMLCS.ERROR:
                    errors++;
                break;

                case HTMLCS.WARNING:
                    warnings++;
                break;

                case HTMLCS.NOTICE:
                    if (showNotices === false) {
                        messages.splice(i, 1);
                        i--;
                    } else {
                        notices++;
                    }
                break;
            }//end switch
        }//end for

        _messages = messages;

        var settingsContents = '';
        var summaryContents  = '';
        var detailContents   = '';

        for (var i = 0; i < messages.length; i++) {
            if ((i % 5) === 0) {
                summaryContents += '<ol class="HTMLCS-issue-list"';

                if (i === 0) {
                    summaryContents += 'style="margin-left: 0em"';
                }

                summaryContents += '>';
            }

            summaryContents += buildMessageSummary(i, messages[i]);

            if (((i % 5) === 4) || (i === (messages.length - 1))) {
                summaryContents += '</ol>';
            }

            detailContents  += buildMessageDetail(i, messages[i], standard);
        }

        var detailWidth  = (i * 35);

        var wrapper       = document.createElement('div');
        wrapper.id        = _prefix + 'wrapper';
        wrapper.className = 'showing-' + options.initialScreen;

        var header = buildHeaderSection(standard);
        wrapper.appendChild(header);

        var summary = buildSummarySection(errors, warnings, notices);
        wrapper.appendChild(summary);

        var settings = buildSettingsSection();
        wrapper.appendChild(settings);

        var outerWrapper       = document.createElement('div');
        outerWrapper.className = _prefix + 'outer-wrapper';
        wrapper.appendChild(outerWrapper);

        var innerWrapper       = document.createElement('div');
        innerWrapper.id        = _prefix + 'issues-wrapper';
        innerWrapper.className = _prefix + 'inner-wrapper';
        outerWrapper.appendChild(innerWrapper);

        var issueList = buildIssueListSection(messages);
        innerWrapper.appendChild(issueList);

        var totalPages = Math.ceil(messages.length / 5);
        var navDiv     = buildNavigation(1, totalPages);
        innerWrapper.appendChild(navDiv);

        var innerWrapper       = document.createElement('div');
        innerWrapper.id        = _prefix + 'issues-detail-wrapper';
        innerWrapper.className = _prefix + 'inner-wrapper';
        outerWrapper.appendChild(innerWrapper);

        var issueDetail = buildIssueDetailSection(messages);
        innerWrapper.appendChild(issueDetail);

        var processingDiv = buildMessageBox('Processing...');
        wrapper.appendChild(processingDiv);

        return wrapper;
    };

    this.changeScreen = function(screen) {
        var wrapper = document.getElementById(_prefix + 'wrapper');

        // Remove current "showing" section, add new one, then clean up the class name.
        wrapper.className  = wrapper.className.replace(new RegExp('showing-' + _screen), '');
        wrapper.className += ' showing-' + screen;
        wrapper.className  = wrapper.className.replace(/\s+/, ' ');
        _screen = screen;
    };

    /**
     * Run HTML_CodeSniffer and place the results in the auditor.
     *
     * @returns undefined
     */
    this.run = function(standard, source, options) {
        if ((source === null) || (source === undefined)) {
            // If not defined (or no longer existing?), check the document.
            source = document;
        } else if (source instanceof Node) {
            // See if we are being sent a text box or text area; if so then
            // examine its contents rather than the node itself.
            if (source.nodeName.toLowerCase() === 'input') {
                if (source.hasAttribute('type') === false) {
                    // Inputs with no type default to text fields.
                    source = source.value;
                } else {
                    var inputType = source.getAttribute('type').toLowerCase();
                    if (inputType === 'text') {
                        // Text field.
                        source = source.value;
                    }
                }
            } else if (source.nodeName.toLowerCase() === 'textarea') {
                // Text area.
                source = source.value;
            }//end if
        }//end if

        if (options === undefined) {
            options = {};
        }

        // Save the options at this point, so we can refresh with them.
        _standard = standard;
        _source   = source;
        _options  = options;
        _page     = 1;

        var self    = this;
        var target  = document.getElementById(_prefix + 'wrapper');

        // Load the "processing" screen.
        options.initialScreen = 'message-box';
        var wrapper = self.build(standard, _messages, options);
        if (target) {
            document.body.replaceChild(wrapper, target);
        } else {
            document.body.appendChild(wrapper);
        }


        // Process and replace with the issue list when finished.
        HTMLCS.process(standard, source, function() {
            options.initialScreen = 'issue-list';
            _messages      = HTMLCS.getMessages();
            var newWrapper = self.build(standard, _messages, options);
            document.body.replaceChild(newWrapper, wrapper);
        });
    };

};
