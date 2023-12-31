import axios from "axios";
import type { AxiosInstance } from "axios";
import type { LinReqConfig, LinInterceptors, LinResponse } from "./types";
import CPromise from "p-cancelable";
class Request {
    // 多个request对象保留实例
    instance: AxiosInstance;
    // 传入自定义拦截器
    interceptors?: LinInterceptors;

    constructor(config: LinReqConfig) {
        // 保留实例
        this.instance = axios.create(config);
        // 保留拦截器
        this.interceptors = config.interceptors;

        // 实例请求拦截器
        this.instance.interceptors.request.use(
            this.interceptors?.reqInterceptor,
            this.interceptors?.reqInterceptorCatch
        );

        // 实例响应拦截器
        this.instance.interceptors.response.use(
            this.interceptors?.resInterceptor,
            this.interceptors?.resInterceptorCatch
        );

        // 所有实例的请求拦截器
        this.instance.interceptors.request.use(
            (config) => {
                return config;
            },
            (err) => {
                return err;
            }
        );
        // 所有实例的响应拦截器
        this.instance?.interceptors.response.use(
            (res) => {
                return res.data;
            },
            (err) => {
                return err;
            }
        );
    }
    /**
     * 统一请求入口封装，可传入单次请求拦截器
     * @param config:LinReqConfig<T>
     * @returns Promise<T>
     */
    request<T = LinResponse>(config: LinReqConfig<T>): CPromise<T> {
        // 创建一个取消标记
        let cancelToken = axios.CancelToken.source();

        // 将取消标记传入 config
        config.cancelToken = cancelToken.token;
        // 请求应当返回promise对象，可使用then/await等进行后续处理
        let promise = new CPromise<T>((resolve, reject) => {
            if (config.interceptors?.reqInterceptor) {
                // 取出单次请求传入的请求拦截器
                const reqInterceptor = config.interceptors?.reqInterceptor;
                // 配置传入单次请求拦截器处理
                config = reqInterceptor(config);
            }

            // 以config配置发起请求
            this.instance.request<any, T>(config).then(
                (res) => {
                    // 判断请求是否被取消
                    if (axios.isCancel(res)) {
                        console.log(res.message);
                        return;
                    }
                    if (config.interceptors?.resInterceptor) {
                        // 取出单次请求传入响应的拦截器
                        const resInterceptor = config.interceptors?.resInterceptor;
                        // 结果传入单次响应拦截器处理后返回
                        res = resInterceptor(res);
                        return res;
                    }
                    resolve(res);
                },
                (err) => {
                    // 判断请求是否被取消
                    if (axios.isCancel(err)) {
                        console.log(err.message);
                        return;
                    }
                    reject(err);
                }
            );
        });
        return promise;
    }
    get<T>(url: string, config?: LinReqConfig<T>) {
        return this.request({ ...config, method: "GET", url });
    }
    post<T>(url: string, config?: LinReqConfig<T>) {
        return this.request<T>({ ...config, method: "POST", url });
    }
}

export default Request;
