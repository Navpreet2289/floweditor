import * as React from 'react';
import Button, { ButtonProps, ButtonTypes } from '~/components/button/Button';
import { renderIf } from '~/utils';

const styles = require('./Dialog.scss');
const shared = require('~/components/shared.scss');

export enum HeaderStyle {
    NORMAL = 'normal',
    BARBER = 'barber'
}

export interface ButtonSet {
    primary: ButtonProps;
    secondary?: ButtonProps;
    tertiary?: ButtonProps;
}

interface Buttons {
    leftButtons: JSX.Element[];
    rightButtons: JSX.Element[];
}

export interface DialogProps {
    title: string;
    subtitle?: string;
    headerIcon?: string;
    headerClass?: string;
    headerStyle?: HeaderStyle;
    buttons?: ButtonSet;
    gutter?: JSX.Element;
    noPadding?: boolean;
}

/**
 * A component that has a front and back and can flip back and forth between them
 */
export default class Dialog extends React.Component<DialogProps> {
    constructor(props: DialogProps) {
        super(props);
    }

    private getButtons(): Buttons {
        const rightButtons: JSX.Element[] = [];

        const buttons = this.props.buttons || { primary: null, secondary: null, tertiary: null };

        if (buttons.secondary) {
            rightButtons.push(
                <Button key={0} {...buttons.secondary} type={ButtonTypes.secondary} />
            );
        }

        if (buttons.primary) {
            rightButtons.push(
                <Button key={1} {...this.props.buttons.primary} type={ButtonTypes.primary} />
            );
        }

        const leftButtons: JSX.Element[] = [];

        // Our left most button if we have one
        if (buttons.tertiary) {
            leftButtons.push(<Button key={0} {...buttons.tertiary} type={ButtonTypes.tertiary} />);
        }

        return {
            leftButtons,
            rightButtons
        };
    }

    public render(): JSX.Element {
        const headerClasses = [styles.header];
        if (this.props.headerClass) {
            headerClasses.push(shared[this.props.headerClass]);
        }

        if (this.props.headerIcon) {
            headerClasses.push(styles.iconed);
        }

        if (this.props.headerStyle === HeaderStyle.BARBER) {
            headerClasses.push(styles.barber);
        }

        const activeClasses = [styles.dialog];
        const { leftButtons, rightButtons } = this.getButtons();

        return (
            <div className={activeClasses.join(' ')}>
                <div className={headerClasses.join(' ')}>
                    {renderIf(this.props.headerIcon !== undefined)(
                        <span className={`${styles.headerIcon} ${this.props.headerIcon}`} />
                    )}
                    <div className={styles.titleContainer}>
                        <div className={styles.title}>{this.props.title}</div>
                        <div className={styles.subtitle}>{this.props.subtitle}</div>
                    </div>
                </div>
                <div className={this.props.noPadding ? '' : styles.content}>
                    {this.props.children}
                </div>

                <div className={styles.footer}>
                    <div className={styles.gutter}>{this.props.gutter}</div>
                    {renderIf(rightButtons.length > 0 || leftButtons.length > 0)(
                        <div className={styles.buttons}>
                            <div className={styles.leftButtons}>{leftButtons}</div>
                            <div className={styles.rightButtons}>{rightButtons}</div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
