import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Form, Input, message } from 'antd';
import { setAuthToken } from '../lib/auth';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (response.ok) {
        setAuthToken(data);
        router.push('/dashboard');
      } else {
        message.error(data.message || 'Login failed');
      }
    } catch (error) {
      message.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-[100dvh] overflow-hidden">
  {/* Left side full background */}
  <div className="hidden md:block w-1/2 bg-cover bg-center relative h-full">
    {/* Updated gradient to match your image's color scheme with animation */}
    <div className="absolute inset-0 bg-gray-100"></div>
  </div>

  {/* Right side full background */}
  <div className="flex items-center justify-center w-full md:w-1/2 bg-gradient-to-br from-blue-600/40 to-purple-700/40 animate-pulse" />

  {/* Floating Center Card */}
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden max-w-4xl w-full mx-4">
      {/* Left column - image */}
      <div className="flex bg-black from-black via-blue-900/70 to-cyan-500/50 animate-pulse backdrop-blur-[1px] pulse-slower">
        <div className="flex items-center justify-center p-6 mr-[16px]">
          <img
            src="/images/tm-hexagon.png"
            alt="Login Illustration"
            className="max-w-xs md:max-w-sm rounded-lg shadow-sm p-4"
          />
        </div>
      </div>

      {/* Right column - login form */}
      <div className="flex-1 p-8">
        <div className="flex justify-center items-baseline mb-6">
          <span className="font-bold text-lg" style={{ color: '#0088FE' }}>LOGIN</span>
          <span className="font-bold text-lg ml-1" style={{ color: '#FF8042' }}>HERE</span>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  </div>
</div>
  );
}
